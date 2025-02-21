import React, { useEffect, useMemo, useState } from "react";
import { googleAnalyticsDimension } from "../../../gtag";
import { BackButton, Button, Modal, PreLoading, RatingStars, ViatorTourInfoImage } from "@tripian/react";
import useViatorApi, { defaultBookingConfirmRequest } from "../../../hooks/useViatorApi";
import { LOCAL_EXPERIENCES, TOUR_INFO, TOURS_AND_TICKETS, TRIPS } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { useHistory } from "react-router";
import useTranslate from "../../../hooks/useTranslate";
import ViatorTourInfoForm from "./ViatorTourInfoForm/ViatorTourInfoForm";
import Model, { helper, Providers } from "@tripian/model";
import useUser from "../../../hooks/useUser";
import Checkout from "./Checkout/Checkout";
import ViatorBookingDetails from "./ViatorBookingDetails/ViatorBookingDetails";
import { useDispatch } from "react-redux";
import { saveNotification } from "../../../redux/action/user";
import ViatorTourOption from "./ViatorTourOption/ViatorTourOption";
import isoLanguages from "./Checkout/ViatorBookingActivityDetails/isoLanguages";
import classes from "./ViatorTourInfo.module.scss";

interface IViatorTourInfo {
  tourId: string;
  cityId: number;
  lat: number;
  lng: number;
  cityName?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  previousRoute?: string;
  flags?: string[];
}

const ViatorTourInfo: React.FC<IViatorTourInfo> = ({ tourId, cityId, lat, lng, cityName, startDate, endDate, adults, children, previousRoute, flags }) => {
  const {
    fetchProductInfo,
    viatorProductInfo,
    fetchProductAvailability,
    viatorProductAvailability,
    exchangeRates,
    successfullBooking,
    fetchProductBookingHold,
    paymentSessionToken,
    loadings,
    bookingConfirmRequest,
    setBookingConfirm,
    setBookingConfirmLoading,
    showInfoModal,
    setBookingInfoModal,
    confirmPayment,
    viatorBookingInfo,
    selectedHour,
    changeSelectedHour,
    availableDate,
    changeAvailableDate,
    locations,
    getCancellationPolicy,
    modalVisible,
    paymentFailed,
    setPaymentFailedModal,
  } = useViatorApi(Number(cityId), cityName, startDate, endDate);

  const [personsCategories, setPersonsCategories] = useState<(Providers.Viator.AgeBand & { count: number })[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTourOptionCode, setSelectedTourOptionCode] = useState<string>();

  const { user } = useUser();

  const history = useHistory();

  const { t } = useTranslate();

  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    fetchProductInfo(tourId).then(() => {
      if (isMounted) {
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viatorProductInfo) {
      googleAnalyticsDimension("viewedProductUrl", viatorProductInfo.info.productUrl);
    }
  }, [viatorProductInfo]);

  useEffect(() => {
    if (viatorProductInfo && viatorProductInfo.info.pricingInfo.ageBands.length > 0) {
      const newPersonsCategories = viatorProductInfo.info.pricingInfo.ageBands.map((x) => ({ ...x, count: 0 }));

      const adultsCount = adults ? Number(adults) : 0;
      const childrenCount = children ? Number(children) : 0;

      // ADULT
      const newAdultsCategories = newPersonsCategories.find((x) => x.ageBand === "ADULT");
      if (newAdultsCategories) {
        newAdultsCategories.count = adultsCount;
      }

      // CHILD
      const newChildrenCategories = newPersonsCategories.find((x) => x.ageBand === "CHILD");
      if (newChildrenCategories) {
        newChildrenCategories.count = childrenCount;
      }

      // TRAVELER
      const travelerCategory = newPersonsCategories.find((x) => x.ageBand === "TRAVELER");
      if (travelerCategory) {
        travelerCategory.count = adultsCount + childrenCount;
      }

      setPersonsCategories(newPersonsCategories);
    }
  }, [adults, children, viatorProductInfo]);

  const cancellationInfo = useMemo(() => {
    const cancellationTime = new Date();
    if (viatorProductInfo) {
      return getCancellationPolicy(viatorProductInfo?.info.cancellationPolicy, cancellationTime);
    }
  }, [getCancellationPolicy, viatorProductInfo]);

  const pickupIncluded = useMemo(() => {
    if (viatorProductInfo?.info.logistics.travelerPickup.pickupOptionType === "PICKUP_EVERYONE") {
      return true;
    } else if (viatorProductInfo?.info.logistics.travelerPickup.pickupOptionType === "PICKUP_AND_MEET_AT_START_POINT") {
      const pickupDesc = viatorProductInfo?.info.productOptions.find((o) => o.productOptionCode === selectedTourOptionCode)?.description;
      if (pickupDesc) {
        const isIncluded = pickupDesc.includes("Pickup included");
        return isIncluded;
      }
      return false;
    }
    return false;
  }, [selectedTourOptionCode, viatorProductInfo?.info.logistics.travelerPickup.pickupOptionType, viatorProductInfo?.info.productOptions]);

  const duration = useMemo(() => {
    if (viatorProductInfo) {
      if (viatorProductInfo.info.itinerary.duration.fixedDurationInMinutes) {
        return (
          <span className={classes.numberOfRatings}>
            {viatorProductInfo.info.itinerary.duration.fixedDurationInMinutes} {t("trips.myTrips.localExperiences.tourDetails.mins")}
          </span>
        );
      }
      if (viatorProductInfo.info.itinerary.duration.variableDurationFromMinutes && viatorProductInfo.info.itinerary.duration.variableDurationToMinutes) {
        return (
          <span className={classes.numberOfRatings}>
            {viatorProductInfo.info.itinerary.duration.variableDurationFromMinutes} - {viatorProductInfo.info.itinerary.duration.variableDurationToMinutes}
            {t("trips.myTrips.localExperiences.tourDetails.mins")}
          </span>
        );
      }
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viatorProductInfo]);

  const onHoldBooking = async (productOptionCode: string) => {
    const request: Providers.Viator.BookingCardHoldRequest = {
      currency: "USD",
      partnerCartRef: `partnerCartRef${Math.random().toString(36).substring(4)}`,
      items: [
        {
          partnerBookingRef: `partnerBookingRef${Math.random().toString(36).substring(4)}`,
          productCode: viatorProductInfo?.availability.productCode || "",
          productOptionCode: productOptionCode,
          startTime: selectedHour !== "" ? selectedHour : undefined,
          travelDate: availableDate,
          paxMix: personsCategories
            .filter((item) => item.count > 0)
            .map((item) => ({
              ageBand: item.ageBand,
              numberOfTravelers: item.count,
            })),
        },
      ],
      paymentDataSubmissionMode: "VIATOR_FORM",
      hostingUrl: window.location.origin,
    };
    const bookingHold = await fetchProductBookingHold(request);

    if (bookingHold === true) {
      setShowCheckout(true);
    } else {
      setShowCheckout(false);
    }
  };

  const onConfirmBooking = async (paymentToken: string) => {
    const bookingConfirm = {
      ...bookingConfirmRequest,
      paymentToken,
    };
    confirmPayment(bookingConfirm);
    setBookingConfirm(defaultBookingConfirmRequest);
  };

  const groupedBookableItems = useMemo(() => {
    if (!viatorProductAvailability?.bookableItems) return [];

    const grouped = viatorProductAvailability.bookableItems.reduce(
      (acc, item) => {
        const { productOptionCode, startTime, available, unavailableReason, totalPrice, lineItems } = item;

        // Initialize group if not already present
        if (!acc[productOptionCode]) {
          acc[productOptionCode] = {
            productOptionCode,
            timedEntries: [],
            available: false, // Default to false, will update if any entry is true
            totalPrice: totalPrice || {}, // Default to an empty object if totalPrice is missing
            lineItems: [],
          };
        }

        // Add timed entry for this startTime if defined
        if (startTime || available !== undefined || unavailableReason) {
          acc[productOptionCode].timedEntries.push({
            startTime,
            available: !!available, // Ensure boolean value
            unavailableReason,
          });
        }

        // Update `available` to true if any entry is available
        if (available) {
          acc[productOptionCode].available = true;
        }

        // Update lineItems and totalPrice (assuming they are consistent across grouped items)
        acc[productOptionCode].lineItems = lineItems;
        acc[productOptionCode].totalPrice = totalPrice;

        return acc;
      },
      {} as Record<
        string,
        {
          productOptionCode: string;
          timedEntries: {
            startTime?: string;
            available: boolean;
            unavailableReason?: string;
          }[];
          available: boolean;
          totalPrice: Providers.Viator.TotalPrice;
          lineItems: Providers.Viator.LineItem[];
        }
      >
    );

    return Object.values(grouped); // Convert grouped object to an array
  }, [viatorProductAvailability?.bookableItems]);

  const forms = (viatorTourDataParam: Providers.Viator.TourData) => {
    if (successfullBooking) {
      googleAnalyticsDimension("bookedProductUrl", viatorTourDataParam.info.productUrl);
      return null;
    } else {
      return (
        <>
          <div className="row px-6">
            <div className="col col12">
              <ViatorTourInfoForm
                bookableItems={viatorTourDataParam.availability.bookableItems}
                productCode={viatorTourDataParam.availability.productCode}
                productOptionCode={selectedTourOptionCode || viatorProductInfo?.availability.bookableItems[0].productOptionCode}
                productURL={viatorTourDataParam.info.productUrl}
                availableDate={availableDate}
                setAvailableDate={changeAvailableDate}
                // selectedHour={selectedHour}
                // setSelectedHour={changeSelectedHour}
                formPersonsCategories={viatorTourDataParam.info.pricingInfo.ageBands}
                personsCategories={personsCategories}
                setPersonsCategories={setPersonsCategories}
                checkAvailabilityClick={(availabilityRequest: Providers.Viator.AvailabilityCheckRequest) => {
                  fetchProductAvailability(availabilityRequest);
                }}
                bookingRequirements={viatorTourDataParam.info.bookingRequirements}
                timeZone={viatorProductInfo?.info.timeZone}
                t={t}
              />
            </div>
          </div>

          {loadings === "loadingViatorProductAvailability" ? (
            <div className="w-full relative h-20">
              <div className={classes.viatorTourDetailsLoader}>
                <PreLoading />
              </div>
            </div>
          ) : (
            <div className="row mb0 px-6">
              {viatorProductAvailability && viatorProductAvailability.bookableItems.length > 0 && (
                <div className="col col12 col8-m mb0">
                  {groupedBookableItems.map((group) => (
                    <ViatorTourOption
                      key={group.productOptionCode}
                      tourOption={group}
                      productOption={viatorProductInfo?.info.productOptions.find((o) => o.productOptionCode === group.productOptionCode)}
                      exchangeRates={exchangeRates}
                      travelDate={viatorProductAvailability.travelDate}
                      selectedHour={selectedHour}
                      setSelectedHour={changeSelectedHour}
                      currency={viatorProductAvailability.currency}
                      bookingRequestCallback={(productOptionCode: string) => {
                        onHoldBooking(productOptionCode);
                      }}
                      setSelectedOption={(productOptionCode: string) => {
                        setSelectedTourOptionCode(productOptionCode);
                      }}
                      isSelected={group.productOptionCode === selectedTourOptionCode}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      );
    }
  };

  if (loadings === "loadingViatorProductInfo" || loadings === "loadingBookingHold" || loadings === "loadingBookingConfirm" || viatorProductInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }

  if (viatorProductInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">
          {t("trips.myTrips.localExperiences.tourDetails.experience.doesNotSupport")} "Viator" {t("trips.myTrips.localExperiences.tourDetails.experience.tours")}.
        </div>
      </>
    );
  }

  const travelPrice = () => {
    if (!viatorProductAvailability?.bookableItems || !selectedTourOptionCode) {
      return undefined;
    }

    const price = viatorProductAvailability.bookableItems.find((b) => b.productOptionCode === selectedTourOptionCode)?.totalPrice.price.partnerTotalPrice;

    return exchangeRates.length > 0 && price ? Number((exchangeRates[0].rate * price).toFixed(1)) : price;
  };

  return (
    <div className={classes.tourInfo}>
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />

      {showCheckout ? (
        <Checkout
          user={user}
          tourName={viatorProductInfo.info.title}
          tourImage={viatorProductInfo.info.images[0].variants[viatorProductInfo.info.images[0].variants.length - 1].url}
          travelHour={selectedHour}
          travelDate={availableDate}
          travelPrice={travelPrice()}
          bookerInfo={bookingConfirmRequest.bookerInfo}
          communication={bookingConfirmRequest.communication}
          bookingQuestions={viatorProductInfo?.bookingQuestions}
          bookingQuestionAnswers={bookingConfirmRequest.items.find((item) => item.bookingQuestionAnswers)?.bookingQuestionAnswers}
          languageGuides={viatorProductInfo.info.productOptions.find((o) => o.productOptionCode === selectedTourOptionCode)?.languageGuides}
          logistics={viatorProductInfo.info.logistics}
          paymentSessionToken={paymentSessionToken}
          locations={locations}
          clickedBookingContactDetails={({ bookerInfo, communication }) => {
            const bookingConfirm = {
              ...bookingConfirmRequest,
              communication,
              bookerInfo,
            };
            setBookingConfirm(bookingConfirm);
          }}
          clickedBookingActivityDetails={({ bookingQuestionAnswers, languageGuide }) => {
            const updatedItems = bookingConfirmRequest.items.map((item) => {
              return {
                ...item,
                bookingQuestionAnswers: bookingQuestionAnswers || item.bookingQuestionAnswers,
                languageGuide: languageGuide || item.languageGuide,
              };
            });

            const updatedBookingConfirmRequest = {
              ...bookingConfirmRequest,
              items: updatedItems,
            };

            setBookingConfirm(updatedBookingConfirmRequest);
          }}
          setPaymentLoading={(loading: boolean) => setBookingConfirmLoading(loading)}
          onPaymentSuccess={(paymentToken: string) => onConfirmBooking(paymentToken)}
          onPaymentError={(error: string) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "ViatorFetchPaymentError", "Submitted card details were invalid or unsupported for this purchase"));
          }}
          travelerCount={personsCategories.reduce((total, traveler) => total + traveler.count, 0)}
          cancellationInfo={cancellationInfo}
          flags={flags}
          pickupIncluded={pickupIncluded}
          modalVisible={modalVisible}
          handleFetchBookingHold={() => selectedTourOptionCode && onHoldBooking(selectedTourOptionCode)}
          t={t}
        />
      ) : (
        <>
          <div className="row mb0 px-6 pt-6">
            <div className="col col12">
              <>
                {history.location.key && (
                  <div className={classes.gygTourInfoBack}>
                    <BackButton
                      fill="#000"
                      clicked={() => {
                        history.goBack();
                      }}
                    />
                  </div>
                )}
              </>
              <h1>{viatorProductInfo.info.title}</h1>
              {viatorProductInfo.info.reviews.totalReviews > 0 && (
                <div className={classes.gygTourInfoRatingStars}>
                  <RatingStars rating={(viatorProductInfo.info.reviews.combinedAverageRating * 20).toString()} />
                  <span className={classes.gygTourInfoOverralRating}>{viatorProductInfo.info.reviews.combinedAverageRating.toFixed(1)}</span>
                  <span className={classes.gygTourInfoReviews}>
                    {viatorProductInfo.info.reviews.totalReviews} {t("trips.myTrips.localExperiences.tourDetails.reviews")}
                  </span>
                  <span className="ml-2 font-medium text-xs">
                    (
                    {viatorProductInfo.info.reviews.sources.map((source, i) => (
                      <>
                        <span className={classes.numberOfRatings}>
                          {helper.capitalizeFirstLetter(source.provider)}: {source.totalCount} {i !== viatorProductInfo.info.reviews.sources.length - 1 ? ", " : ""}
                        </span>
                      </>
                    ))}
                    )
                  </span>
                </div>
              )}
            </div>

            <div className="col col12">
              <ViatorTourInfoImage tourImage={viatorProductInfo.info.images} />
            </div>
            <div className="row">
              <div className="col col12">{viatorProductInfo.info.description}</div>
            </div>

            <div className="row mb0">
              <div className="col col12">
                <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.title")}</h2>

                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.duration")}</h4>
                  </div>
                  <div className="col col12 col10-m">
                    <span>{duration}</span>
                  </div>
                </div>

                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.cancelation")}</h4>
                  </div>
                  <div className="col col12 col10-m">
                    {viatorProductInfo.info.cancellationPolicy.description &&
                      (/<[a-z][\s\S]*>/i.test(viatorProductInfo.info.cancellationPolicy.description) ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: viatorProductInfo.info.cancellationPolicy.description,
                          }}
                        />
                      ) : (
                        <div>{viatorProductInfo.info.cancellationPolicy.description}</div>
                      ))}
                  </div>{" "}
                </div>

                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.ticketInfo")}</h4>
                  </div>
                  <div className="col col12 col10-m">{viatorProductInfo.info.ticketInfo.ticketTypeDescription}</div>
                </div>
                {viatorProductInfo.info.language && (
                  <div className="row mb2">
                    <div className="col col12 col2-m">
                      <h4>{t("trips.myTrips.localExperiences.tourDetails.tourLanguage")}</h4>
                    </div>
                    <div className="col col12 col10-m">{isoLanguages.find((l) => l.code === viatorProductInfo.info.language)?.name || "English"}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {forms(viatorProductInfo)}

          <div className="row mb0 px-6">
            <div className="col col12">
              <h2 className="pb8 font-bold text-base">{t("trips.myTrips.localExperiences.tourDetails.experience.title")}</h2>
              {viatorProductInfo.info.inclusions && viatorProductInfo.info.inclusions.length > 0 && (
                <>
                  <div className="row mb2">
                    <div className="col col12 col2-m">
                      <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.includes")}</h4>
                    </div>
                    <div className="col col12 col10-m">
                      {viatorProductInfo.info.inclusions.map((inclusion) => (
                        <div key={`inclusions-${Math.random()}`}>
                          <li>{inclusion.description || inclusion.otherDescription || inclusion.typeDescription}</li>
                          <br />
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="mb6" style={{ opacity: 0.2 }} />
                </>
              )}

              {viatorProductInfo.info.exclusions && viatorProductInfo.info.exclusions.length > 0 && (
                <>
                  <div className="row mb2">
                    <div className="col col12 col2-m">
                      <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.excludes")}</h4>
                    </div>
                    <div className="col col12 col10-m">
                      {viatorProductInfo.info.exclusions.map((exclusion) => (
                        <div key={`exclusions-${Math.random()}`}>
                          <li>{exclusion.description || exclusion.otherDescription || exclusion.typeDescription}</li>
                          <br />
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="mb6" style={{ opacity: 0.2 }} />
                </>
              )}

              {viatorProductInfo.info.additionalInfo && (
                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.additionalInformation")}</h4>
                  </div>
                  <div className="col col12 col10-m">
                    {viatorProductInfo.info.additionalInfo.map((additional_info) => (
                      <div key={`additional_information-${Math.random()}`}>
                        <li>{additional_info.description}</li>
                        <br />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showInfoModal && (
        <Modal show={showInfoModal} className="!min-w-[90%] !w-[90%] bg-background-color md:!min-w-[50%] md:!w-32 shadow-2xl">
          <div className="row m0 p-4">
            <ViatorBookingDetails
              items={viatorBookingInfo?.items}
              totalConfirmedPrice={viatorBookingInfo?.totalConfirmedPrice}
              voucherInfo={viatorBookingInfo?.voucherInfo}
              tourName={viatorProductInfo.info.title}
              tourImage={viatorProductInfo.info.images[0].variants[viatorProductInfo.info.images[0].variants.length - 1].url}
              travelHour={selectedHour}
              travelDate={availableDate}
              buttonText={t("trips.myTrips.localExperiences.tourDetails.close")}
              clicked={() => {
                setBookingInfoModal(false);
                if (previousRoute) {
                  if (previousRoute === TOURS_AND_TICKETS.PATH) {
                    history.push(
                      `${LOCAL_EXPERIENCES.PATH}?city_id=${cityId}&city_name=${cityName}&lat=${lat}&lng=${lng}&start_date=${startDate}&end_date=${endDate}&adult=${adults}${
                        children ? `&children=${children}` : ""
                      }`
                    );
                  } else {
                    history.push(previousRoute);
                  }
                } else {
                  history.push(TRIPS.PATH);
                }
              }}
              t={t}
            />
          </div>
        </Modal>
      )}

      <Modal show={paymentFailed} className="booking-modal p5 min-w-[90%] md:min-w-0">
        <div className="row m0">
          <div className="flex w-full text-center flex-col mb-8 font-bold text-xl mr-1">{t("trips.myTrips.localExperiences.tourDetails.paymentFailed")}</div>
          <div className="w-full flex justify-evenly">
            <Button
              color="primary"
              text={t("trips.myTrips.itinerary.offers.payment.goBack")}
              onClick={() => {
                setPaymentFailedModal(false);
                if (previousRoute) {
                  if (previousRoute === TOURS_AND_TICKETS.PATH) {
                    history.push(
                      `${LOCAL_EXPERIENCES.PATH}?city_id=${cityId}&city_name=${cityName}&start_date=${startDate}&end_date=${endDate}&adult=${adults}${
                        children ? `&children=${children}` : ""
                      }`
                    );
                  } else {
                    history.push(previousRoute);
                  }
                } else {
                  history.push(TRIPS.PATH);
                }
              }}
            />

            <Button
              color="secondary"
              text={t("trips.myTrips.localExperiences.tourDetails.tryAgain")}
              onClick={() => {
                setPaymentFailedModal(false);
                selectedTourOptionCode && onHoldBooking(selectedTourOptionCode);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViatorTourInfo;
