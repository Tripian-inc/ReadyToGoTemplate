import React, { useEffect, useState, useMemo } from "react";
import useTranslate from "../../hooks/useTranslate";
import Model, { helper, Providers } from "@tripian/model";
import { CloseIconButton, Modal, PreLoading, ReservationDetails, Button, BookingDetails } from "@tripian/react";
import AppNav from "../../App/AppNav/AppNav";
import { MY_BOOKINGS_PAGE } from "../../constants/ROUTER_PATH_TITLE";
import useReservation from "../../hooks/useReservation";
import ViatorBookingDetails from "../TourInfo/ViatorTourInfo/ViatorBookingDetails/ViatorBookingDetails";
import moment from "moment";
import BookingCard from "../../components/BookingCard/BookingCard";
import { UserReservation } from "@tripian/model/api/v4";
import classes from "./MyBookingsPage.module.scss";

const MyBookingsPage = () => {
  const { yelpReservations, gygReservations, viatorReservations, reservationCancel, loadingReservations, loadingReservation, initReservations } = useReservation();
  const { t } = useTranslate();

  const [yelpReservationDetailsModalState, setYelpReservationDetailsModalState] = useState<{
    show: boolean;
    reservationDetails?: UserReservation;
  }>({
    show: false,
  });

  const [gygReservationDetailsModalState, setGygReservationDetailsModalState] = useState<{
    show: boolean;
    reservationDetails?: UserReservation;
  }>({
    show: false,
  });

  const [viatorReservationDetailsModalState, setViatorReservationDetailsModalState] = useState<{
    show: boolean;
    reservationDetails?: UserReservation;
  }>({
    show: false,
  });

  useEffect(() => {
    initReservations();
  }, [initReservations]);

  /* */
  /* */
  /* ******* YELP RESERVATION DETAILS ******* */
  const memoizedYelpReservationDetailsModal = useMemo(() => {
    const yelpReservationInfo = yelpReservationDetailsModalState.reservationDetails?.value as Providers.Yelp.ReservationInfo;
    return (
      <Modal
        show={yelpReservationDetailsModalState.show}
        className={`${classes.bookingModal} p5`}
        backdropClick={() => {
          if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
        }}
      >
        <div className="row mb0">
          <div className={`${classes.tripPlannerModalCloseIcon} m2`}>
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
              }}
            />
          </div>
          {yelpReservationDetailsModalState.reservationDetails ? (
            <div>
              {loadingReservation ? (
                <div className={classes.createUpdateTripLoading}>
                  <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
                </div>
              ) : null}
              <div>
                <ReservationDetails reservationInfo={yelpReservationInfo} t={t} />
              </div>

              {moment(yelpReservationDetailsModalState.reservationDetails.bookingDateTime).isAfter(moment()) && (
                <div className="row center">
                  <div>
                    <Button
                      color="primary"
                      text="Cancel Reservation"
                      onClick={() => {
                        setYelpReservationDetailsModalState((prevState) => ({
                          ...prevState,
                        }));
                        reservationCancel(yelpReservationInfo.reservation_id || "")?.then(() => {
                          setYelpReservationDetailsModalState({ show: false });
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Modal>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yelpReservationDetailsModalState.show, yelpReservationDetailsModalState.reservationDetails, loadingReservation, reservationCancel]);

  /* */
  /* */
  /* ******* GYG RESERVATION DETAILS ******* */
  const gygReservationDetailsModal = useMemo(() => {
    const gygReservationInfo = gygReservationDetailsModalState.reservationDetails?.value as Providers.Gyg.TourReservationDetails;

    return (
      <Modal
        show={gygReservationDetailsModalState.show}
        className="booking-modal p5"
        backdropClick={() => {
          if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
        }}
      >
        <div className="row m0">
          <div className="travel-guide-modal-close-icon m2">
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
              }}
            />
          </div>
          {gygReservationDetailsModalState.reservationDetails ? (
            <div>
              {loadingReservation ? (
                <div className={classes.createUpdateTripLoading}>
                  <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
                </div>
              ) : null}
              <div>
                <BookingDetails bookingInfo={gygReservationInfo} />
              </div>
              <div className={classes.bookingReservationCancelText}>
                <div>Manage ticket through email confirmation from provider or click link above.</div>
              </div>
              {/* <div className="row center">
                <div>
                  <Button
                    color="primary"
                    text="Cancel Reservation"
                    onClick={() => {
                      setGygReservationDetailsModalState((prevState) => ({
                        ...prevState,
                      }));
                      memoizedBookingCancel(gygReservationDetailsModalState.reservationDetails?.data.shopping_cart.shopping_cart_hash || "");
                    }}
                  />
                </div>
              </div> */}
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }, [gygReservationDetailsModalState.show, gygReservationDetailsModalState.reservationDetails, loadingReservation]);

  /* */
  /* */
  /* ******* VIATOR RESERVATION DETAILS ******* */
  const viatorReservationDetailsModal = useMemo(() => {
    const viatorReservationInfo = viatorReservationDetailsModalState.reservationDetails?.value as Providers.Viator.BookingReservationDetails;

    return (
      <Modal
        show={viatorReservationDetailsModalState.show}
        className="!min-w-[90%] !w-[90%] bg-background-color md:!min-w-[50%] md:!w-32 shadow-2xl"
        backdropClick={() => {
          if (!loadingReservation) setViatorReservationDetailsModalState({ show: false });
        }}
      >
        <div className="row m0 p-4">
          <div className="absolute m-2 top-0 right-0 w-9 h-9 cursor-pointer drop-shadow-[0_3px_2px_rgba(0,0,0,1)]">
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setViatorReservationDetailsModalState({ show: false });
              }}
            />
          </div>
          {viatorReservationDetailsModalState.reservationDetails ? (
            <div className="w-full">
              <ViatorBookingDetails
                items={viatorReservationInfo.items}
                totalConfirmedPrice={viatorReservationInfo.totalConfirmedPrice}
                voucherInfo={viatorReservationInfo.voucherInfo}
                tourName={viatorReservationInfo.tourName}
                tourImage={viatorReservationInfo.tourImage}
                travelHour={viatorReservationInfo.selectedHour}
                travelDate={viatorReservationInfo.availableDate}
                loading={loadingReservation}
                showButton={moment(viatorReservationDetailsModalState.reservationDetails.bookingDateTime).isAfter(moment())}
                buttonText={t("trips.myTrips.localExperiences.tourDetails.cancelReservation")}
                clicked={() => {
                  setViatorReservationDetailsModalState((prevState) => ({
                    ...prevState,
                  }));
                  reservationCancel(viatorReservationInfo.items[0].bookingRef || "")?.then(() => {
                    setViatorReservationDetailsModalState({ show: false });
                  });
                }}
                t={t}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }, [viatorReservationDetailsModalState.show, viatorReservationDetailsModalState.reservationDetails, loadingReservation, t, reservationCancel]);

  const orderedModals = useMemo(() => {
    const oneModal = () => {
      if (yelpReservationDetailsModalState.show) return memoizedYelpReservationDetailsModal;
      if (gygReservationDetailsModalState.show) return gygReservationDetailsModal;
      if (viatorReservationDetailsModalState.show) return viatorReservationDetailsModal;
      return null;
    };

    return <>{oneModal()}</>;
  }, [
    gygReservationDetailsModal,
    gygReservationDetailsModalState.show,
    memoizedYelpReservationDetailsModal,
    viatorReservationDetailsModal,
    viatorReservationDetailsModalState.show,
    yelpReservationDetailsModalState.show,
  ]);

  const filteredUserReservations: Model.UserReservation[] = yelpReservations || [];

  return (
    <div>
      <AppNav header={MY_BOOKINGS_PAGE.HEADER?.(t("trips.myTrips.itinerary.bookings.title"))} />
      {!loadingReservations ? (
        <div className={`row mb0 bg-background-color ${classes.bookingPopUp}`}>
          <div className="col col12 m5 p0 mb0">
            {filteredUserReservations.length === 0 && (!gygReservations || gygReservations.length === 0) && (!viatorReservations || viatorReservations.length === 0) ? (
              <div className="center mt8">
                <span>{t("trips.myTrips.itinerary.bookings.emptyMessage")}</span>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center bg-gray-100 w-fit my-0 mx-auto p-4 rounded-2xl">
                {filteredUserReservations.map((yelpReservation) => {
                  const yelpReservationInfo = yelpReservation.value as Providers.Yelp.ReservationInfo;
                  return (
                    <BookingCard
                      key={yelpReservationInfo.reservation_id}
                      image={yelpReservationInfo.restaurant_image}
                      title={yelpReservationInfo.restaurant_name}
                      dateTime={`${yelpReservationInfo.reservation_details.date}${
                        yelpReservationInfo.reservation_details.time ? `, ${yelpReservationInfo.reservation_details.time}` : ""
                      }`}
                      person={yelpReservationInfo.reservation_details.covers === 1 ? "1 person" : `${yelpReservationInfo.reservation_details.covers} people`}
                      provider="GETYOURGUIDE"
                      pastBooking={moment().isAfter(moment(yelpReservation.bookingDateTime))}
                      clicked={() => setYelpReservationDetailsModalState({ show: true, reservationDetails: yelpReservation })}
                      t={t}
                    />
                  );
                })}
                {gygReservations?.map((gygReservation) => {
                  const gygReservationInfo = gygReservation.value as Providers.Gyg.TourReservationDetails;
                  const formattedImg = helper.getYourGuideImageFormat(gygReservationInfo.data.shopping_cart.tour_image, "60");
                  return (
                    <BookingCard
                      key={gygReservationInfo.data.shopping_cart.shopping_cart_hash}
                      image={formattedImg}
                      title={gygReservationInfo.data.shopping_cart.tour_name}
                      dateTime={`${moment(gygReservationInfo.data.shopping_cart.bookings[0].bookable.datetime).format("MMM DD - HH:mm")}`}
                      person={gygReservationInfo.data.shopping_cart.bookings.length === 1 ? "1 person" : `${gygReservationInfo.data.shopping_cart.bookings.length} people`}
                      provider="GETYOURGUIDE"
                      pastBooking={moment().isAfter(moment(gygReservation.bookingDateTime))}
                      clicked={() => setGygReservationDetailsModalState({ show: true, reservationDetails: gygReservation })}
                      t={t}
                    />
                  );
                })}

                {viatorReservations
                  ?.sort((a, b) => moment(b.bookingDateTime).diff(moment(a.bookingDateTime)))
                  .map((viatorReservation) => {
                    const viatorReservationInfo = viatorReservation.value as Providers.Viator.BookingReservationDetails;
                    const numberOfTravelers = viatorReservationInfo?.items[0].lineItems ? viatorReservationInfo?.items[0].lineItems[0].numberOfTravelers : undefined;
                    return (
                      <BookingCard
                        key={viatorReservationInfo.cartRef}
                        image={viatorReservationInfo.tourImage}
                        title={viatorReservationInfo.tourName}
                        dateTime={`${viatorReservationInfo.availableDate}${viatorReservationInfo.selectedHour ? `, ${viatorReservationInfo.selectedHour}` : ""}`}
                        person={
                          numberOfTravelers
                            ? numberOfTravelers === 1
                              ? `1 ${t("trips.myTrips.localExperiences.tourDetails.person")}`
                              : `${numberOfTravelers} ${t("trips.myTrips.localExperiences.tourDetails.people")}`
                            : undefined
                        }
                        status={viatorReservationInfo.items[0].status}
                        provider="VIATOR"
                        pastBooking={moment().isAfter(moment(viatorReservation.bookingDateTime))}
                        clicked={() => setViatorReservationDetailsModalState({ show: true, reservationDetails: viatorReservation })}
                        t={t}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={classes.loadingWrapper}>
          <PreLoading />
        </div>
      )}

      {orderedModals}
    </div>
  );
};

export default MyBookingsPage;
