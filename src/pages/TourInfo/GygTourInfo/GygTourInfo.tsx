import React, { useEffect, useMemo, useState } from "react";
import { googleAnalyticsDimension } from "../../../gtag";
import { BackButton, Button, GygTourInfoImage, GygTourShoppingForm, PreLoading, RatingStars, ReadMoreLess } from "@tripian/react";
import Model, { Providers } from "@tripian/model";
import useUser from "../../../hooks/useUser";
import { useGygApi } from "../../../hooks/useGygApi";
import { TOUR_INFO, TRIPS } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { useHistory } from "react-router";
import GygTourInfoForm from "./GygTourInfoForm/GygTourInfoForm";
import GygTourOption from "./GygTourInfoForm/GygTourOption/GygTourOption";
import moment from "moment";
import classes from "./GygTourInfo.module.scss";

interface IGygTourInfo {
  cityId: number;
  cityName?: string;
  tourId: number;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  t: (value: Model.TranslationKey) => string;
}

const GygTourInfo: React.FC<IGygTourInfo> = ({ cityId, cityName, tourId, startDate, endDate, adults, children, t }) => {
  const [availableDate, setAvailableDate] = useState<string | undefined>(undefined);
  const [personsCategories, setPersonsCategories] = useState<(Providers.Gyg.PersonCategory & { count: number })[]>([]);
  const [showShoppingForm, setShowShoppingForm] = useState(false);

  const { user } = useUser();

  const history = useHistory();

  const {
    fetchGygTourDataCombo,
    gygTourData,
    gygTourBooking,
    gygBookingInfo,
    gygLoaders,
    confirmPayment,
    successfullBooking,
    fetchGygTourOptions,
    fetchGygTourPriceBreakdown,
    gygTourPriceBreakdown,
    gygTourOptions,
    errorMessage,
  } = useGygApi(cityId, cityName, startDate, endDate, adults, children);

  useEffect(() => {
    // console.log("errorMessage", errorMessage);
    if (errorMessage && history) {
      // console.log("0: errorMessage");
      if (history.location.key) {
        // console.log("1: Go Back", history.location.key);
        history.goBack();
      } else {
        // console.log("2: Go Trips");
        history.replace(TRIPS.PATH);
      }
      // console.log("3");
    }
  }, [errorMessage, history]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchGygTourDataCombo(Number(tourId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gygTourData?.availability.available_dates && gygTourData.availability.available_dates.length > 0) {
      const availableDates = gygTourData.availability.available_dates.map((item) => item.date);
      const startMoment = moment(startDate);
      let selectedDate = availableDates[0];

      if (startMoment.isValid()) {
        for (let i = 0; i < availableDates.length; i++) {
          const currentMoment = moment(availableDates[i]);
          if (currentMoment.isSameOrAfter(startMoment)) {
            selectedDate = availableDates[i];
            break;
          }
        }
      }

      setAvailableDate(selectedDate);
    }
  }, [gygTourData?.availability.available_dates, startDate]);

  useEffect(() => {
    if (gygTourData && gygTourData.availability.categories.length > 0) {
      const newPersonsCategories = gygTourData.availability.categories.map((x) => ({ ...x, count: 0 }));

      const adultsCount = adults ? Number(adults) : 0;
      const childrenCount = children ? Number(children) : 0;

      // ADULT
      const newAdultsCategories = newPersonsCategories.find((x) => x.ticket_category === "adult");
      if (newAdultsCategories) {
        newAdultsCategories.count = adultsCount;
      }

      // CHILD
      const newChildrenCategories = newPersonsCategories.find((x) => x.ticket_category === "child");
      if (newChildrenCategories) {
        newChildrenCategories.count = childrenCount;
      }

      // GROUP
      const travelerCategory = newPersonsCategories.find((x) => x.ticket_category === "group");
      if (travelerCategory) {
        travelerCategory.count = adultsCount + childrenCount;
      }

      setPersonsCategories(newPersonsCategories);
    }
  }, [adults, children, gygTourData]);

  useEffect(() => {
    if (gygTourData) {
      googleAnalyticsDimension("viewedProductUrl", gygTourData?.tour.url);
    }
  }, [gygTourData]);

  const guideType = gygTourData?.tour.guide_type?.replaceAll("_", " ");

  const splitInfo = (info: string | undefined) => {
    if (info) {
      const splittedInfo = info.split(/\r\n|\n|\r/);
      return splittedInfo;
    }
    return [];
  };

  const availableDatesInRange = useMemo(() => {
    if (!gygTourData?.availability.available_dates || !startDate || !endDate) {
      return [];
    }

    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    return gygTourData?.availability.available_dates
      .filter((dateObj) => {
        const date = moment(dateObj.date);
        return date.isSameOrAfter(startMoment) && date.isSameOrBefore(endMoment);
      })
      .map((dateObj) => dateObj.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gygTourData?.availability.available_dates, startDate, endDate]);

  const forms = (gygTourDataParam: Providers.Gyg.TourData) => {
    if (successfullBooking) {
      googleAnalyticsDimension("bookedProductUrl", gygTourDataParam.tour.url);
      return null;
    } else {
      if (gygLoaders.bookingLoader) {
        return <PreLoading />;
      } else {
        if (gygBookingInfo && showShoppingForm) {
          return (
            <div className="row">
              <GygTourShoppingForm clicked={confirmPayment} user={user} goBack={() => setShowShoppingForm(false)} t={t} />
            </div>
          );
        } else {
          return (
            <>
              <div className="row">
                <div className="col col12">
                  <GygTourInfoForm
                    availableDates={availableDatesInRange}
                    availableDate={availableDate}
                    setAvailableDate={setAvailableDate}
                    formPersonsCategories={gygTourDataParam.availability.categories}
                    personsCategories={personsCategories}
                    setPersonsCategories={setPersonsCategories}
                    checkAvailabilityClick={(tourOptionsRequest: Providers.Gyg.TourPriceBreakdownRequest) => {
                      if (gygTourData) {
                        const totalParticipants = Object.values(tourOptionsRequest.data.participants).reduce((acc, val) => acc + val, 0);
                        if (totalParticipants <= gygTourData.availability.participants_range.max) {
                          fetchGygTourPriceBreakdown(gygTourData.tour.tour_id, tourOptionsRequest);
                        }
                        fetchGygTourOptions(gygTourData.tour.tour_id, availableDate || "");
                      }
                    }}
                    t={t}
                  />
                </div>
              </div>

              {gygLoaders.tourDetailsLoader ? (
                <div className={classes.gygTourDetailsLoader}>
                  <PreLoading />
                </div>
              ) : (
                <div className="row mb0">
                  {gygTourPriceBreakdown && gygTourPriceBreakdown.tour_options.length > 0 && (
                    <div className="col col12 col8-m mb0">
                      {gygTourPriceBreakdown.tour_options.filter((t) =>
                        t.time_slots.some((slot) => slot.price_breakdown?.price_summary?.retail_price !== undefined && slot.price_breakdown?.price_summary?.currency !== undefined)
                      ).length > 0 ? (
                        gygTourPriceBreakdown.tour_options
                          .filter((t) =>
                            t.time_slots.some(
                              (slot) => slot.price_breakdown?.price_summary?.retail_price !== undefined && slot.price_breakdown?.price_summary?.currency !== undefined
                            )
                          )
                          .map((tourDataOption) => (
                            <GygTourOption
                              key={tourDataOption.option_id.toString()}
                              tourPriceBreakdownOption={tourDataOption}
                              tourOption={gygTourOptions?.find((t) => t.option_id === tourDataOption.option_id)}
                              title={gygTourData?.tour.title}
                              startTime={availableDate}
                              bookingRequestCallback={async (bookingRequest: Providers.Gyg.TourBookingRequest) => {
                                const booking = await gygTourBooking(bookingRequest);
                                if (booking === true) setShowShoppingForm(true);
                              }}
                              personsCategories={personsCategories}
                              participantsRange={gygTourData?.availability.participants_range}
                              t={t}
                            />
                          ))
                      ) : (
                        <p className="text-center mb-8 text-red-500">{t("trips.myTrips.localExperiences.tourDetails.optionNotFound")}.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          );
        }
      }
    }
  };
  if (gygLoaders.tourDataLoader || gygTourData === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (gygTourData === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">
          {t("trips.myTrips.localExperiences.tourDetails.experience.doesNotSupport")} "GetYourGuide" {t("trips.myTrips.localExperiences.tourDetails.experience.tours")}.
        </div>
      </>
    );
  }
  return (
    <div className={classes.tourInfo}>
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
      <div className="row mb0">
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
          <h1>{gygTourData.tour.title}</h1>
          <div className={classes.gygTourInfoRatingStars}>
            <RatingStars rating={(gygTourData.tour.overall_rating * 20).toString()} />
            <span className={classes.gygTourInfoOverralRating}>{gygTourData.tour.overall_rating.toFixed(1)}</span>
            <span className={classes.gygTourInfoReviews}>
              {gygTourData.tour.number_of_ratings} {t("trips.myTrips.localExperiences.tourDetails.reviews")}
            </span>
          </div>
        </div>

        <div className="col col12">
          <GygTourInfoImage tourImage={gygTourData.tour.pictures} />
        </div>
        {/* <hr className="mb6" style={{ opacity: 0.2 }} /> */}
        <div className="row">
          <div className="col col12">{gygTourData.tour.abstract}</div>
        </div>

        <div className="row mb0">
          <div className="col col12">
            <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.title")}</h2>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.duration")}</h4>
              </div>
              <div className="col col12 col10-m">
                {gygTourData.tour.durations.map((duration) => (
                  <span key={`duration-${duration.duration}`}>{`${duration.duration}  ${duration.unit} `}</span>
                ))}
              </div>
            </div>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.cancelation")}</h4>
              </div>
              <div className="col col12 col10-m">{gygTourData.tour.cancellation_policy_text}</div>
            </div>

            <div className="row mb0">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.guide")}</h4>
              </div>
              <div className="col col12 col10-m">{guideType?.charAt(0).toUpperCase() + guideType!.slice(1)}</div>
            </div>
          </div>
        </div>
      </div>
      {cityId && cityName ? (
        forms(gygTourData)
      ) : (
        <div className={classes.mainDiv}>
          <div className="center">
            <Button color="primary" className={classes.addToChartButton} onClick={() => window.open(gygTourData.tour.url)} text="BOOK NOW" />
          </div>
        </div>
      )}
      <div className="row mb0">
        <div className="col col12">
          <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.experience.title")}</h2>
          <div className={`row mb2 ${classes.tourInfoAlign}`}>
            <div className="col col12 col2-m">
              <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.itinerary")}</h4>
            </div>
            <div className="col col12 col10-m">
              {gygTourData.tour.locations.map((location) => (
                <div key={`places-${location.location_id}-${Math.random()}`}>
                  <li>{location.name}</li>
                  <br />
                </div>
              ))}
            </div>
          </div>
          <hr className="mb6" style={{ opacity: 0.2 }} />
          {gygTourData.tour.highlights && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.highlights")}</h4>
              </div>
              <div className="col col12 col10-m">
                {gygTourData.tour.highlights?.map((highlight) => (
                  <div key={`highlight-${Math.random()}`}>
                    <li>{highlight}</li>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          <hr className="mb6" style={{ opacity: 0.2 }} />
          {gygTourData.tour.description && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.fullDescription")}</h4>
              </div>
              <div className="col col12 col10-m">
                <ReadMoreLess desc={gygTourData.tour.description} defaultCharLenght={340} t={t} />
              </div>
            </div>
          )}
          <hr className="mb6" style={{ opacity: 0.2 }} />
          {gygTourData.tour.inclusions && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.includes")}</h4>
              </div>
              <div className="col col12 col10-m">
                {splitInfo(gygTourData.tour.inclusions).map((inclusion) => (
                  <div key={`inclusions-${Math.random()}`}>
                    <li>{inclusion}</li>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          <hr className="mb6" style={{ opacity: 0.2 }} />
          {gygTourData.tour.exclusions && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.excludes")}</h4>
              </div>
              <div className="col col12 col10-m">
                {splitInfo(gygTourData.tour.exclusions).map((exclusion) => (
                  <div key={`exclusions-${Math.random()}`}>
                    <li>{exclusion}</li>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className="mb6" style={{ opacity: 0.2 }} />
          {gygTourData.tour.additional_information && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.importantInformation")}</h4>
              </div>
              <div className="col col12 col10-m">
                {splitInfo(gygTourData.tour.additional_information).map((additional_info) => (
                  <div key={`additional_information-${Math.random()}`}>
                    <li>{additional_info.replaceAll("•", "")}</li>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GygTourInfo;
