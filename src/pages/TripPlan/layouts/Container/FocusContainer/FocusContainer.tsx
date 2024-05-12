/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */

import moment from "moment";
import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Model, { Providers } from "@tripian/model";
import { easy, providers } from "@tripian/core";
import { StepInfo, PoiInfo, AccommondationInfo, Modal, Booking, Button, PreLoading, CloseIconButton, ReservationDetails, BbAccommodationInfo, BbCarRentInfo } from "@tripian/react";
import { PLACE_INFO, QR_READER } from "../../../../../constants/ROUTER_PATH_TITLE";
import useTrip from "../../../../../hooks/useTrip";
import usePlan from "../../../../../hooks/usePlan";
import useStep from "../../../../../hooks/useStep";
import useFavorite from "../../../../../hooks/useFavorite";
import useReservation from "../../../../../hooks/useReservation";
import useFocus from "../../../../../hooks/useFocus";
import useUser from "../../../../../hooks/useUser";
import useTranslate from "../../../../../hooks/useTranslate";
import { useDispatch } from "react-redux";
import { changeLoadingReference, saveNotification } from "../../../../../redux/action/trip";
import useFeedBack from "../../../../../hooks/useFeedback";
import { CloneModal } from "../../../../../components/CloneModal/CloneModal";
import classes from "./FocusContainer.module.scss";

interface IFocusContainer {
  // show: boolean;
  planId?: number;
  // focus: { step?: Model.Step; alternative?: { poi: Model.Poi; stepId: number }; search?: Model.Poi };
  showTourInfoModal: (id: string) => void;
  isLoadingOffer: (offerId: number) => boolean;
  myAllOffers?: Model.Poi[];
  offerOptIn: (offerId: number, optInDate: string) => Promise<void>;
  offerOptOut: (offerId: number) => Promise<void>;
}

const FocusContainer: React.FC<IFocusContainer> = ({ /* show, */ planId, /* focus, */ showTourInfoModal, isLoadingOffer, myAllOffers, offerOptIn, offerOptOut }) => {
  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
  const [bookingModalState, setBookingModalState] = useState<{
    show: boolean;
    businessId: string;
    isEditMode: boolean;
    poi?: Model.Poi;
  }>({
    show: false,
    businessId: "",
    isEditMode: false,
  });

  const { tripReference, tripUpdate, tripFetchCallback, tripReadOnly } = useTrip();
  const { plans } = usePlan();
  const { stepAdd, stepDelete, stepReplace } = useStep();
  const { favorites, favoriteAdd, favoriteDelete, loadingFavoritePoi } = useFavorite();
  const { reservationAdd, loadingReservation, yelpReservations, reservationCancel } = useReservation();
  const { focus, focusLost } = useFocus();
  const { user } = useUser();
  // const { isLoadingOffer, myAllOffers, offerOptIn, offerOptOut } = useMyOffers();
  const { loadingFeedback, feedbacks, feedbackAdd } = useFeedBack();

  const { t } = useTranslate();

  const dispatch = useDispatch();

  const history = useHistory();

  const planDate: string | undefined = useMemo(() => plans?.find((currentPlan) => currentPlan.id === planId)?.date, [planId, plans]);

  const { hash } = useParams<{ hash: string }>();

  const focusContainerClasses = [classes.focusContainer];
  if (!window.tconfig.SHOW_OVERVIEW) focusContainerClasses.push("container-height");
  else focusContainerClasses.push("container-height-tab");
  if (focus.step || focus.alternative || focus.poi || focus.providerPoi || focus.carRentOffer) focusContainerClasses.push(classes.focusContainerOpen);
  else focusContainerClasses.push(classes.focusContainerClose);

  const isFavorite = (poiId: string) => (favorites ? favorites.findIndex((favorite) => favorite.poiId === poiId) > -1 : false);
  const favoriteToggle = (add: boolean, poiId: string) => {
    if (add) {
      favoriteAdd(poiId);
    } else {
      const favoriteId: number = favorites?.find((favorite) => favorite.poiId === poiId)?.id || 0;
      if (favoriteId) favoriteDelete(favoriteId, poiId);
      // eslint-disable-next-line no-console
      else console.error("favoriteToggle favorite delete error: Can not found poi id in favorite list", add, poiId, favorites);
    }
  };

  const getPartOfDay = useCallback(() => {
    const findDaysNumbers = (poiId: string): number[] | undefined => {
      if (poiId === "") return undefined;

      if (plans) {
        const partOfDayIndexes: number[] = [];
        for (let i = 0; i < plans.length; i += 1) {
          const stepIndex = plans[i].steps.findIndex((step) => step.poi.id === poiId);
          if (stepIndex > -1) {
            // console.log('getPartOfDay dayNumber', stepIndex + 1);
            partOfDayIndexes.push(i + 1);
            // return i + 1;
          }
        }
        return partOfDayIndexes;
      }
      return undefined;
    };

    if (focus.step) {
      return findDaysNumbers(focus.step.poi.id);
    }

    if (focus.alternative) {
      return findDaysNumbers(focus.alternative.poi.id);
    }

    if (focus.poi) {
      return findDaysNumbers(focus.poi.id);
    }

    return undefined;
  }, [focus.alternative, focus.poi, focus.step, plans]);

  const sendFeedback = (feedback: Model.FeedbackRequest, poiId?: string) => {
    const newFeedback = { ...feedback };
    newFeedback.poiId = poiId;
    newFeedback.tripHash = tripReference?.tripHash;
    newFeedback.desc = feedback.desc.replace(/^\s+|\s+$/g, "");
    return feedbackAdd(newFeedback);
  };

  const memoizedBookingClicked = useCallback((productId: string, poi: Model.Poi) => {
    const providerId = window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS.find((pId) => poi.bookings.some((booking) => booking.providerId === pId));
    const booking = poi.bookings.find((c) => c.providerId === providerId);

    if (booking) {
      const productUrl = booking.products[0].url;

      if (booking.providerId === Model.PROVIDER_ID.OPEN_TABLE) {
        window.open(productUrl || "https://www.opentable.com");
      } else {
        if (window.tconfig.PROVIDERS.restaurant.find((x) => x.id === Model.PROVIDER_ID.YELP)?.prod ?? true) {
          window.open(productUrl || "https://www.yelp.com");
        } else {
          setBookingModalState({ show: true, businessId: productId, isEditMode: false, poi });
        }
      }
    }
  }, []);

  const memoizedReservationRequest = useCallback(
    (reservationModel: Providers.Yelp.ReservationRequest) => providers.yelp?.reservation(reservationModel) as Promise<Providers.Yelp.Reservation>,
    []
  );

  const memoizedBookingCallback = useCallback(
    (provider: string, poi: Model.Poi, reservationDetails: Providers.Yelp.ReservationRequest, response?: Providers.Yelp.Reservation) => {
      if (response) {
        const reservationInfo: Providers.Yelp.ReservationInfo = {
          confirm_url: response.confirmation_url,
          reservation_id: response.reservation_id || "",
          restaurant_image: (poi.image && poi.image.url) ?? "",
          restaurant_name: poi.name,
          reservation_details: reservationDetails,
        };

        reservationAdd({ key: Model.PROVIDER_NAME.YELP, tripHash: hash, poiId: poi.id, provider, value: reservationInfo }, false).finally(() => {
          setBookingModalState({ show: false, businessId: "", isEditMode: false });
        });
      }

      return null;
    },
    [hash, reservationAdd]
  );

  const memoizedCurrentReservationUrl = useCallback(
    (poiId: string) => {
      const currentUserReservation = yelpReservations?.find((reservation) => reservation.poiId === poiId)?.value as Providers.Yelp.ReservationInfo;

      if (currentUserReservation) {
        return currentUserReservation.confirm_url;
      }

      return undefined;
    },
    [yelpReservations]
  );

  const offerButtonOnChange = (optIn: boolean, offer: Model.Offer, optInDate: string) => {
    if (tripReadOnly) {
      cloneTrip();
    } else {
      if (optIn) {
        if (offer.offerType === Model.OFFER_TYPE.VOUCHER) {
          const tdate = new easy.TDate({
            startDate: offer.timeframe.start,
            endDate: offer.timeframe.end,
            recurrent: offer.timeframe.recurrent,
            blackouts: offer.timeframe.blackouts,
          });
          if (tdate.toList().includes(optInDate)) {
            offerOptIn(offer.id, optInDate);
          } else {
            dispatch(
              saveNotification(Model.NOTIFICATION_TYPE.WARNING, t("notification.offerOptIn.name"), t("notification.offerOptIn.title"), t("notification.offerOptIn.message"))
            );
          }
        } else {
          offerOptIn(offer.id, optInDate);
        }
      } else {
        return offerOptOut(offer.id);
      }
    }
  };

  // YelpReservation Api Requests for inner form
  const yelpGetBusinesInfo = useCallback((businessId: string) => providers.yelp?.business(businessId) as Promise<Providers.Yelp.Business>, []);

  const yelpOpeningRequest = useCallback((openings: Providers.Yelp.OpeningsRequest) => providers.yelp?.openings(openings) as Promise<Providers.Yelp.Openings>, []);

  const yelpGetHoldIt = useCallback((hold: Providers.Yelp.HoldRequest) => providers.yelp?.hold(hold) as Promise<Providers.Yelp.Hold>, []);

  const memoizedBookingModal = useMemo(() => {
    const currentReservation = yelpReservations?.find((reservation) => reservation.poiId === bookingModalState.poi?.id);
    const coversCount = (tripReference?.tripProfile.numberOfAdults || 0) + (tripReference?.tripProfile.numberOfChildren || 0);
    const userProfileBooking: { firstName: string; lastName: string; email: string; coversCount: number } = {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      coversCount,
    };

    return (
      <Modal
        show={bookingModalState.show}
        className={`${classes.bookingModal} p5`}
        backdropClick={() => {
          if (!loadingReservation) setBookingModalState({ show: false, businessId: "", isEditMode: false });
        }}
      >
        <div>
          <div className={`${classes.bookingModalCloseIcon} m1`}>
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setBookingModalState({ show: false, businessId: "", isEditMode: false });
              }}
            />
          </div>
          {loadingReservation ? (
            <div className={classes.focusContainerLoading}>
              <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
            </div>
          ) : null}
          <div>
            {currentReservation && !bookingModalState.isEditMode ? (
              <ReservationDetails reservationInfo={currentReservation.value as Providers.Yelp.ReservationInfo} />
            ) : bookingModalState.poi && bookingModalState.show ? (
              <Booking
                businessId={bookingModalState.businessId}
                poi={bookingModalState.poi}
                stepDate={planDate || ""}
                // stepHour={focus.step?.hours.from}
                userProfileBooking={userProfileBooking}
                getBusinessInfo={yelpGetBusinesInfo}
                openingsRequest={yelpOpeningRequest}
                getHoldIt={yelpGetHoldIt}
                reservationRequest={memoizedReservationRequest}
                bookingCallback={memoizedBookingCallback}
              />
            ) : null}
          </div>
          {currentReservation && !bookingModalState.isEditMode ? (
            <div className="row center">
              <div>
                <Button
                  color="primary"
                  text="Cancel Reservation"
                  onClick={() => {
                    setBookingModalState((prevState) => ({
                      ...prevState,
                    }));
                    reservationCancel((currentReservation?.value as Providers.Yelp.ReservationInfo).reservation_id)?.finally(() => {
                      setBookingModalState({ show: false, businessId: "", isEditMode: false });
                    });
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }, [
    yelpReservations,
    tripReference,
    user,
    bookingModalState.show,
    bookingModalState.isEditMode,
    bookingModalState.poi,
    bookingModalState.businessId,
    loadingReservation,
    planDate,
    yelpGetBusinesInfo,
    yelpOpeningRequest,
    yelpGetHoldIt,
    memoizedReservationRequest,
    memoizedBookingCallback,
    reservationCancel,
  ]);

  const cloneTrip = () => {
    setShowCloneModal(true);
  };

  const renderContent = () => {
    if (focus.step) {
      if (focus.step.id === 0) {
        /*
          id: 0,
          icon: "Homebase",
          name: accommendation.name || "AccommendationState Name",
          description: accommendation.address || "AccommendationState Address",
          coordinate: accommendation.coordinate || { lat: 0, lng: 0 },
          web: accommendation.refID ?? "",
          address: accommendation.provider ?? "Google",
          image: {
            url: accommendation.imageUrl ?? "",
            imageOwner: { title: "", url: ""  },
            width: null,
            height: null,
          },
         */
        const accommodation: Model.Accommodation = {
          refID: focus.step.poi.web ?? "FocusContainer_renderContent_imposible",
          name: focus.step.poi.name,
          address: focus.step.poi.description,
          coordinate: focus.step.poi.coordinate,
          imageUrl: (focus.step.poi.image && focus.step.poi.image.url) ?? "",
          provider: focus.step.poi.address,
        };
        return (
          <AccommondationInfo
            accommodation={accommodation}
            close={() => {
              focusLost();
            }}
            t={t}
          />
        );
      }

      return (
        <div className="scrollable-y">
          <StepInfo
            key={`focus_poi_${focus.step.id}`}
            dayNumbers={getPartOfDay() || [500]}
            step={focus.step}
            favorite={isFavorite(focus.step.poi.id)}
            toggleFavorite={(poi: Model.Poi, willFavorite: boolean) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                // console.log(`${poi.name} added to favorites..`);
                favoriteToggle(willFavorite, poi.id);
              }
            }}
            close={() => {
              focusLost();
            }}
            removeStep={(stepId) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                focusLost();
                stepDelete(stepId);
              }
            }}
            bookingButtonClick={memoizedBookingClicked}
            planDate={planDate}
            // planDate={planDate && focus.step.hour.from ? `${planDate} ${focus.step.hours.from}` : undefined}
            favoriteLoading={loadingFavoritePoi(focus.step.poi.id)}
            reservationUrl={memoizedCurrentReservationUrl(focus.step.poi.id)}
            hideBookingButton={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            hideTours={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            getTourInfo={showTourInfoModal}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            myOffers={myAllOffers || []}
            isLoadingOffer={isLoadingOffer}
            offerButtonClick={offerButtonOnChange}
            hideOffers={!window.tconfig.SHOW_OFFERS}
            loadingFeedback={loadingFeedback}
            feedbackSubjects={feedbacks?.poiSubjects || []}
            sendFeedback={(feedback: Model.FeedbackRequest) => {
              if (tripReadOnly) {
                cloneTrip();
                return Promise.resolve();
              } else {
                return sendFeedback(feedback, focus.step?.poi.id);
              }
            }}
            placeInfoCallBack={() => window.open(`${PLACE_INFO.PATH}/${focus.step?.poi.id}`, "_blank")}
            showStepScoreDetails={window.tconfig.SHOW_STEP_SCORE_DETAIL}
            t={t}
          />
        </div>
      );
    }

    if (focus.alternative)
      return (
        <div className="scrollable-y">
          <PoiInfo
            dayNumbers={getPartOfDay()}
            key={`focus_alternative_poi_${focus.alternative.poi.id}`}
            poi={focus.alternative.poi}
            favorite={isFavorite(focus.alternative.poi.id)}
            toggleFavorite={(poi: Model.Poi, willFavorite: boolean) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                // console.log(`${poi.name} added to favorites..`);
                favoriteToggle(willFavorite, poi.id);
              }
            }}
            close={() => {
              focusLost();
            }}
            addRemoveReplacePoi={(poi: Model.Poi, flag: number) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                focusLost();
                if (flag === 1) {
                  // add poi to step
                  console.error("FocusContainer: step add called by alternative poi!"); // eslint-disable-line no-console
                } else if (flag === 0) {
                  // replace poi to step
                  if (focus.alternative) {
                    focusLost();
                    stepReplace(focus.alternative.stepId, focus.alternative.poi.id);
                  } else console.error("FocusContainer: step replace called without replaceStepId!"); // eslint-disable-line no-console
                } else if (flag === -1) {
                  // remove poi from step
                  // eslint-disable-next-line no-console
                  console.error(
                    `FocusContainer:
                  PoiInfo never calls this remove step prop directly.
                  Only StepInfo component handle this event with StepInfo.removeStep`
                  );
                }
              }
            }}
            replace
            favoriteLoading={loadingFavoritePoi(focus.alternative.poi.id)}
            bookingButtonClick={memoizedBookingClicked}
            reservationUrl={memoizedCurrentReservationUrl(focus.alternative.poi.id)}
            hideBookingButton={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            square={false}
            hideTours={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            planDate={planDate}
            myOffers={myAllOffers || []}
            isLoadingOffer={isLoadingOffer}
            offerButtonClick={offerButtonOnChange}
            hideOffers={!window.tconfig.SHOW_OFFERS}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            getTourInfo={showTourInfoModal}
            loadingFeedback={loadingFeedback}
            feedbackSubjects={feedbacks?.poiSubjects || []}
            sendFeedback={(feedback: Model.FeedbackRequest) => {
              if (tripReadOnly) {
                cloneTrip();
                return Promise.resolve();
              } else {
                return sendFeedback(feedback, focus.alternative?.poi.id);
              }
            }}
            placeInfoCallBack={() => window.open(`${PLACE_INFO.PATH}/${focus.alternative?.poi.id}`, "_blank")}
            redeemClicked={() => history.push(QR_READER.PATH)}
            t={t}
          />
        </div>
      );

    if (focus.poi)
      return (
        <div className="scrollable-y">
          <PoiInfo
            key={`focus_search_poi_${focus.poi.id}`}
            dayNumbers={getPartOfDay()}
            poi={focus.poi}
            favorite={isFavorite(focus.poi.id)}
            toggleFavorite={(poi: Model.Poi, willFavorite: boolean) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                // console.log(`${poi.name} added to favorites..`);
                favoriteToggle(willFavorite, poi.id);
              }
            }}
            close={() => {
              focusLost();
            }}
            addRemoveReplacePoi={(poi: Model.Poi, flag: number, from?: string, to?: string) => {
              if (tripReadOnly) {
                cloneTrip();
              } else {
                focusLost();

                if (flag === 1) {
                  // add poi to step
                  if (planId) stepAdd(planId, poi.id, from, to);
                  else console.error("FocusContainer: step add called without planId!"); // eslint-disable-line no-console
                } else if (flag === 0) {
                  // replace poi to step
                  // if (focus.poi) dispatch(stepReplace(focus.alternative.stepId, focus.alternative.poi.id));
                  // else console.error('FocusContainer: step replace called without replaceStepId!'); // eslint-disable-line no-console
                  console.error("FocusContainer: step replace called with same poi!"); // eslint-disable-line no-console
                } else if (flag === -1) {
                  // remove poi from step
                  // eslint-disable-next-line no-console
                  console.error(
                    `FocusContainer:
                  PoiInfo never calls this remove step prop directly.
                  Only StepInfo component handle this event with StepInfo.removeStep`
                  );
                }
              }
            }}
            replace={false}
            favoriteLoading={loadingFavoritePoi(focus.poi.id)}
            bookingButtonClick={memoizedBookingClicked}
            reservationUrl={memoizedCurrentReservationUrl(focus.poi.id)}
            hideBookingButton={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            square={false}
            hideTours={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            planDate={planDate}
            myOffers={myAllOffers || []}
            isLoadingOffer={isLoadingOffer}
            offerButtonClick={offerButtonOnChange}
            hideOffers={!window.tconfig.SHOW_OFFERS}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            getTourInfo={showTourInfoModal}
            loadingFeedback={loadingFeedback}
            feedbackSubjects={feedbacks?.poiSubjects || []}
            sendFeedback={(feedback: Model.FeedbackRequest) => {
              if (tripReadOnly) {
                cloneTrip();
                return Promise.resolve();
              } else {
                return sendFeedback(feedback, focus.poi?.id);
              }
            }}
            placeInfoCallBack={() => window.open(`${PLACE_INFO.PATH}/${focus.poi?.id}`, "_blank")}
            redeemClicked={() => history.push(QR_READER.PATH)}
            t={t}
          />
        </div>
      );

    if (focus.providerPoi && tripReference) {
      const checkIn = moment(tripReference.tripProfile.arrivalDatetime).format("MMM DD,YYYY");
      const checkOutDefault = moment(tripReference.tripProfile.departureDatetime).format("MMM DD,YYYY");

      const checkOut = checkIn === checkOutDefault ? moment(tripReference.tripProfile.departureDatetime).add("day", 1).format("MMM DD,YYYY") : checkOutDefault;

      return (
        <div className="scrollable-y">
          <BbAccommodationInfo
            adults={tripReference?.tripProfile.numberOfAdults || 1}
            children={tripReference?.tripProfile.numberOfChildren ? tripReference?.tripProfile.numberOfChildren : 0}
            checkIn={checkIn}
            checkOut={checkOut}
            key={`focus_search_provider_poi_${focus.providerPoi.info.hotelCode}`}
            hotelOffer={focus.providerPoi}
            onBookNow={(url) => {
              console.log(focus.providerPoi, url);
              window.open(url);
            }}
            onAddToItinerary={(accommodation: Model.Accommodation) => {
              console.log("Update Trip accommodation with ", accommodation);
              if (tripReference) {
                dispatch(changeLoadingReference(true));
                tripUpdate(tripReference.tripHash, { ...tripReference.tripProfile, accommodation, doNotGenerate: 0 }).then((trip: Model.Trip) => {
                  tripFetchCallback(trip);
                  dispatch(changeLoadingReference(false));
                });
              }
            }}
            close={() => {
              focusLost();
            }}
            t={t}
            /* 

            close={() => {
              focusLost();
            }} 

            bookingButtonClick={memoizedBookingClicked}
            
            */
          />
        </div>
      );
    }

    if (focus.carRentOffer && tripReference) {
      const pickUpDateTime = moment(tripReference.tripProfile.arrivalDatetime).format("MMM DD,YYYY");
      const dropOffDateTimeDefault = moment(tripReference.tripProfile.departureDatetime).format("MMM DD,YYYY");

      const dropOffDateTime =
        pickUpDateTime === dropOffDateTimeDefault ? moment(tripReference.tripProfile.departureDatetime).add("day", 1).format("MMM DD,YYYY") : dropOffDateTimeDefault;

      return (
        <div className="scrollable-y">
          <BbCarRentInfo
            pickUpDateTime={pickUpDateTime}
            dropOffDateTime={dropOffDateTime}
            key={`focus_search_car_rent_info_${focus.carRentOffer.locationCode}`}
            offer={focus.carRentOffer}
            onRentNow={(url) => {
              // console.log(focus.carRentOffer, url);
              window.open(url);
            }}
            close={() => {
              focusLost();
            }}
            dateOfBirth={user?.dateOfBirth}
            t={t}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {memoizedBookingModal}
      <div className={focusContainerClasses.join(" ")}>{renderContent()}</div>
      {showCloneModal && <CloneModal sharedTripHash={tripReference?.tripHash ?? ""} onCancel={() => setShowCloneModal(false)} />}
    </>
  );
};

export default FocusContainer;
