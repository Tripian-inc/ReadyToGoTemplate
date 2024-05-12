import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Model, { helper, Providers } from "@tripian/model";
import { api, providers } from "@tripian/core";

import ICombinedState from "../redux/model/ICombinedState";
import { saveNotification, changeLoadingReservations, changeReservations } from "../redux/action/trip";

const useReservation = (cityIdParam?: number) => {
  const [loadingReservation, setLoadingReservation] = useState<boolean>(false);
  const { cityId, reservations, loadingReservations, readOnlyTrip } = useSelector((state: ICombinedState) => ({
    cityId: state.trip.reference?.city.id,
    reservations: state.trip.reservations,
    loadingReservations: state.trip.loading.reservations,
    readOnlyTrip: state.trip.readOnly,
  }));
  const dispatch = useDispatch();

  const yelpReservations = useMemo(() => reservations?.filter((rs) => rs.provider === Model.PROVIDER_NAME.YELP), [reservations]);
  const gygReservations = useMemo(() => reservations?.filter((rs) => rs.provider === Model.PROVIDER_NAME.GYG), [reservations]);

  const reservationsFetch = useCallback((): Promise<Model.UserReservation[]> => {
    if (cityId === undefined || readOnlyTrip === true) {
      // eslint-disable-next-line no-console
      console.warn("reservationsFetch called with undefined cityId");
      return Promise.resolve([]);
    }
    dispatch(changeLoadingReservations(true));

    return api
      .reservations(cityId, undefined, undefined, undefined, moment().subtract(1, "days").format("YYYY-MM-DD"))
      .then(
        (userReservations: Model.UserReservation[]) =>
          // dispatch(changeReservations(userReservations));
          userReservations
      )

      .catch((reservationsFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationsFetch", "Fetch Reservations", reservationsFetchError));
        throw reservationsFetchError;
      });
    // .finally(() => {
    //   dispatch(changeLoadingReservations(false));
    // });
  }, [cityId, dispatch, readOnlyTrip]);

  const reservationAdd = useCallback(
    async (reservationRequest: Model.UserReservationRequest, showLoading = true): Promise<Model.UserReservation[]> => {
      setLoadingReservation(showLoading);

      try {
        try {
          const newUserReservations = await api.combo.reservationAdd(reservationRequest, cityId || cityIdParam || 0);
          dispatch(changeReservations(newUserReservations));
          return newUserReservations;
        } catch (reservationAddError) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationAdd", "Add Reservation", reservationAddError as string));
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
          if (save) dispatch(changeReservations(newUserReservations));
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
          if (save) dispatch(changeReservations(newReservations));
          return newReservations;
        } catch (reservationDeleteError) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationDelete", "Delete Reservation", reservationDeleteError as string));
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

      return undefined;
    },

    [dispatch, reservationDelete, yelpReservations, gygReservations]
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
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reservationStatus", "Reservation status error", error ? (error as string) : ""));
      }
    },
    [dispatch, reservationDelete, reservationUpdate]
  );

  const initReservations = () => {
    if (reservations === undefined && loadingReservations === false && cityId !== undefined) {
      reservationsFetch().then((apiReservationData: Model.UserReservation[]) => {
        const apiYelpReservationData: Model.UserReservation[] = apiReservationData?.filter((rs) => rs.provider === Model.PROVIDER_NAME.YELP);

        if (apiYelpReservationData.length > 0) {
          yelpReservationStatusCheck(apiReservationData).then(() => {
            reservationsFetch().then((statusCheckedReservationData: Model.UserReservation[]) => {
              dispatch(changeReservations(statusCheckedReservationData));
              dispatch(changeLoadingReservations(false));
            });
          });
        } else {
          dispatch(changeReservations(apiReservationData));
          dispatch(changeLoadingReservations(false));
        }
      });
    }
  };

  return {
    reservations,
    loadingReservations,
    loadingReservation,
    yelpReservations,
    gygReservations,
    reservationsFetch,
    reservationAdd,
    reservationUpdate,
    reservationDelete,
    reservationCancel,
    initReservations,
  };
};

export default useReservation;
