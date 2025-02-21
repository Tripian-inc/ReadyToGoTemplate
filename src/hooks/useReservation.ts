import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { api, providers } from "@tripian/core";

import ICombinedState from "../redux/model/ICombinedState";
import { saveNotification } from "../redux/action/trip";

const useReservation = (cityIdParam?: number) => {
  const [loadingReservation, setLoadingReservation] = useState<boolean>(false);
  const [reservations, setReservations] = useState<Model.UserReservation[] | undefined>();
  const [loadingReservations, setLoadingReservations] = useState<boolean>(false);
  const [viatorStatusCheckInProgress, setViatorStatusCheckInProgress] = useState(false);
  const { cityId, /* reservations, loadingReservations,*/ readOnlyTrip } = useSelector((state: ICombinedState) => ({
    cityId: state.trip.reference?.city.id,
    // reservations: state.trip.reservations,
    // loadingReservations: state.trip.loading.reservations,
    readOnlyTrip: state.trip.readOnly,
  }));
  const dispatch = useDispatch();

  const yelpReservations = useMemo(() => reservations?.filter((rs) => rs.provider === Model.PROVIDER_NAME.YELP), [reservations]);
  const gygReservations = useMemo(() => reservations?.filter((rs) => rs.provider === Model.PROVIDER_NAME.GYG), [reservations]);
  const viatorReservations = useMemo(() => reservations?.filter((rs) => rs.provider === Model.PROVIDER_NAME.VIATOR), [reservations]);

  const reservationsFetch = useCallback((): Promise<Model.UserReservation[]> => {
    if (readOnlyTrip === true) {
      // eslint-disable-next-line no-console
      console.warn("reservationsFetch called with readOnlyTrip");
      return Promise.resolve([]);
    }
    // dispatch(changeLoadingReservations(true));
    setLoadingReservations(true);

    return api
      .reservations()
      .then((userReservations: Model.UserReservation[]) => {
        // dispatch(changeReservations(userReservations));
        return userReservations;
      })

      .catch((reservationsFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationsFetch", "Fetch Reservations", reservationsFetchError));
        throw reservationsFetchError;
      });
    // .finally(() => {
    //   dispatch(changeLoadingReservations(false));
    // });
  }, [dispatch, readOnlyTrip]);

  const reservationAdd = useCallback(
    async (reservationRequest: Model.UserReservationRequest, showLoading = true): Promise<Model.UserReservation[]> => {
      setLoadingReservation(showLoading);

      try {
        try {
          const newUserReservations = await api.combo.reservationAdd(reservationRequest, cityId || cityIdParam || 0);
          // dispatch(changeReservations(newUserReservations));
          setReservations(newUserReservations);
          return newUserReservations;
        } catch (reservationAddError) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationAdd", reservationAddError as string));
          throw reservationAddError;
        }
      } finally {
        if (showLoading) setLoadingReservation(false);
      }
    },
    [cityId, cityIdParam, dispatch]
  );

  const reservationUpdate = useCallback(
    (reservation: Model.UserReservation, save = true): Promise<Model.UserReservation[]> => {
      if (save) setLoadingReservation(true);

      return api.combo
        .reservationUpdate(reservation, cityId || 0)
        .then((newUserReservations: Model.UserReservation[]) => {
          // if (save) dispatch(changeReservations(newUserReservations));
          if (save) setReservations(newUserReservations);
          return newUserReservations;
        })

        .catch((reservationUpdateError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationUpdate", "Update Reservation", reservationUpdateError));
          throw reservationUpdateError;
        })
        .finally(() => {
          if (save) setLoadingReservation(false);
        });
    },
    [cityId, dispatch]
  );

  const reservationDelete = useCallback(
    async (reservationId: number, save = true): Promise<Model.UserReservation[]> => {
      if (save) setLoadingReservation(true);

      try {
        try {
          const newReservations = await api.combo.reservationDelete(reservationId, cityId || 0);
          // if (save) dispatch(changeReservations(newReservations));
          if (save) setReservations(newReservations);
          return newReservations;
        } catch (reservationDeleteError) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationDelete", reservationDeleteError as string));
          throw reservationDeleteError;
        }
      } finally {
        if (save) setLoadingReservation(false);
      }
    },
    [cityId, dispatch]
  );

  // yelp reservation cancel with tripian api reservation delete request. Cancel in our forms.
  const reservationCancel = useCallback(
    (reservationId: string) => {
      // yelp request loading
      setLoadingReservation(true);

      // tripian yelp reservation data
      const currentYelpReservation = yelpReservations?.find(
        (reservation) => reservation.provider === Model.PROVIDER_NAME.YELP && (reservation.value as Providers.Yelp.ReservationInfo).reservation_id === reservationId
      );

      // tripian gyg reservation data
      const currentGygReservation = gygReservations?.find(
        (reservation) =>
          reservation.provider === Model.PROVIDER_NAME.GYG &&
          (reservation.value as Providers.Gyg.TourReservationDetails).data.shopping_cart.shopping_cart_id === Number(reservationId)
      );

      // tripian viator reservation data

      const currentViatorReservation = viatorReservations?.find(
        (reservation) =>
          reservation.provider === Model.PROVIDER_NAME.VIATOR && (reservation.value as Providers.Viator.BookingReservationDetails).items[0].bookingRef === reservationId
      );

      if (currentYelpReservation) {
        return providers.yelp
          ?.reservationCancel(reservationId)
          .then(() => reservationDelete(currentYelpReservation.id))
          .catch((yelpReservationCancelError) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "yelpReservationCancel", "Yelp Reservation Cancel", yelpReservationCancelError));
            throw yelpReservationCancelError;
          })
          .finally(() => {
            setLoadingReservation(false);
          });
      }

      if (currentGygReservation) {
        return providers.gyg
          ?.bookingDelete(reservationId)
          .then(() => reservationDelete(currentGygReservation.id))
          .catch((gygReservationDelete) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "yelpReservationCancel", "Gyg Reservation Cancel", gygReservationDelete));
            throw gygReservationDelete;
          })
          .finally(() => {
            setLoadingReservation(false);
          });
      }

      if (currentViatorReservation) {
        return providers.viator
          ?.bookingCancel(reservationId)
          .then((data) => {
            if (data.status === "ACCEPTED") {
              reservationDelete(currentViatorReservation.id);
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.SUCCESS, "viatorReservationCancel", "Successfully canceled."));
            }
            if (data.status === "DECLINED") {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorReservationCancel", data.reason));
            }
          })
          .catch((viatorReservationDelete) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorReservationCancel", viatorReservationDelete));
          })
          .finally(() => {
            setLoadingReservation(false);
          });
      }

      return undefined;
    },

    [yelpReservations, gygReservations, viatorReservations, reservationDelete, dispatch]
  );

  // Manuel edit or cancel in mail or Yelp.com check
  const yelpReservationStatusCheck = useCallback(
    async (apiReservations: Model.UserReservation[]) => {
      const apiYelpReservations = apiReservations.filter((rs) => rs.provider === Model.PROVIDER_NAME.YELP);
      const reservationStatusPromises: Promise<Providers.Yelp.ReservationStatusResponse | undefined>[] = [];
      const allYelpReservations: Model.UserReservation[] = [];

      apiYelpReservations.forEach((tripianYelpReservation, index) => {
        const reservationPromises = async (userReservation: Model.UserReservation): Promise<Providers.Yelp.ReservationStatusResponse | undefined> => {
          await helper.delay(index * 1000);
          return providers.yelp?.reservationStatus((userReservation.value as Providers.Yelp.ReservationInfo).reservation_id);
        };

        const reservationStatusResponse = reservationPromises(tripianYelpReservation);
        allYelpReservations.push(tripianYelpReservation);
        reservationStatusPromises.push(reservationStatusResponse);
      });

      try {
        const values = await Promise.all(reservationStatusPromises);
        values.forEach((value: Providers.Yelp.ReservationStatusResponse | undefined, pIndex) => {
          const currentReservation: Model.UserReservation = allYelpReservations[pIndex];

          const currentReservationInfo: Providers.Yelp.ReservationInfo = currentReservation.value as Providers.Yelp.ReservationInfo;

          if (value && !value.active) {
            reservationDelete(currentReservation?.id, false);
          } else if (
            (value && value.covers !== currentReservationInfo.reservation_details.covers) ||
            (value && currentReservationInfo.reservation_details.date !== value.date) ||
            (value && currentReservationInfo.reservation_details.time !== value?.time.slice(0, 5))
          ) {
            const differentReservation = { ...currentReservation };
            (differentReservation.value as Providers.Yelp.ReservationInfo).reservation_details = {
              ...(differentReservation.value as Providers.Yelp.ReservationInfo).reservation_details,
              covers: value.covers,
              date: value.date,
              time: value.time.slice(0, 5),
            };

            reservationUpdate(differentReservation, false);
          }
        });
      } catch (error) {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationStatus", error ? (error as string) : ""));
      }
    },
    [dispatch, reservationDelete, reservationUpdate]
  );

  const viatorReservationStatusCheck = useCallback(
    async (apiReservations: Model.UserReservation[]) => {
      if (viatorStatusCheckInProgress) return;

      setViatorStatusCheckInProgress(true);

      const pendingViatorReservations = apiReservations.filter(
        (rs) => rs.provider === Model.PROVIDER_NAME.VIATOR && (rs.value as Providers.Viator.BookingReservationDetails).items[0].status === "PENDING"
      );

      if (pendingViatorReservations.length === 0) {
        setViatorStatusCheckInProgress(false);
        return;
      }

      const reservationStatusPromises = pendingViatorReservations.map((reservation) => {
        const reservationDetails = reservation.value as Providers.Viator.BookingReservationDetails;
        return providers.viator?.bookingStatus({ bookingRef: reservationDetails.items[0].bookingRef });
      });

      try {
        const values = await Promise.all(reservationStatusPromises);

        await Promise.all(
          values.map((value, index) => {
            const currentReservation = pendingViatorReservations[index];
            const currentReservationInfo = currentReservation.value as Providers.Viator.BookingReservationDetails;

            if (value && value.status !== "PENDING" && value.status !== currentReservationInfo.items[0].status) {
              const updatedReservation = { ...currentReservation };
              (updatedReservation.value as Providers.Viator.BookingReservationDetails).items[0].status = value.status;

              return reservationUpdate(updatedReservation, true);
            }
            return Promise.resolve();
          })
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log("error", error);
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorReservationStatusCheck", errorMessage));
      } finally {
        setViatorStatusCheckInProgress(false);
      }
    },
    [dispatch, reservationUpdate, viatorStatusCheckInProgress]
  );

  const initReservations = () => {
    if (reservations === undefined && loadingReservations === false) {
      reservationsFetch().then((apiReservationData: Model.UserReservation[]) => {
        const apiYelpReservationData = apiReservationData.filter((rs) => rs.provider === Model.PROVIDER_NAME.YELP);
        const apiViatorReservationData = apiReservationData.filter((rs) => rs.provider === Model.PROVIDER_NAME.VIATOR);

        // Step 2: Create status check promises for Yelp and Viator
        const yelpStatusCheckPromise = apiYelpReservationData.length > 0 ? yelpReservationStatusCheck(apiReservationData) : Promise.resolve();
        const viatorStatusCheckPromise = apiViatorReservationData.length > 0 && !viatorStatusCheckInProgress ? viatorReservationStatusCheck(apiReservationData) : Promise.resolve();

        // Step 3: Wait for both status checks to complete
        Promise.all([yelpStatusCheckPromise, viatorStatusCheckPromise])
          .then(() => {
            // Step 4: Re-fetch reservations data after status checks
            reservationsFetch().then((statusCheckedReservationData: Model.UserReservation[]) => {
              setReservations(statusCheckedReservationData);
              setLoadingReservations(false);
            });
          })
          .catch((error) => {
            console.error("Error checking reservation statuses", error);
            setLoadingReservations(false);
          });
      });
    }
  };

  return {
    reservations,
    loadingReservations,
    loadingReservation,
    yelpReservations,
    gygReservations,
    viatorReservations,
    reservationsFetch,
    reservationAdd,
    reservationUpdate,
    reservationDelete,
    reservationCancel,
    initReservations,
  };
};

export default useReservation;
