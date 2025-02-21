// import moment from "moment";
import Model from "@tripian/model";
// import { api, providers } from "@tripian/core";

import IStepAlternatives from "../../models/IStepAlternatives";
import IFavoritePoi from "../../models/IFavoritePoi";
import IAction from "../model/IAction";
// import { IThunkResult, IThunkDispatch } from "../actionType/thunk";
import * as TRIP_ACTIONS from "../actionType/trip";
// import ICombinedState from "../model/ICombinedState";

/**
 *
 * Trip Data
 *
 */
export const changeReference = (reference: Model.TripReference): IAction => ({
  type: TRIP_ACTIONS.CHANGE_REFERENCE,
  payload: { reference },
});

export const changeReadOnly = (readOnly: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_READ_ONLY,
  payload: { readOnly },
});

export const changePlans = (plans: Model.Plan[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_PLANS,
  payload: { plans },
});

export const changePlan = (plan: Model.Plan): IAction => ({
  type: TRIP_ACTIONS.CHANGE_PLAN,
  payload: { plan },
});

/**
 *
 * Relational Data
 *
 */
export const changeAlternatives = (alternatives?: IStepAlternatives[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_ALTERNATIVES,
  payload: { alternatives },
});

export const changeFavorites = (favorites?: IFavoritePoi[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_FAVORITES,
  payload: { favorites },
});

export const changeReactions = (reactions?: Model.UserReaction[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_REACTIONS,
  payload: { reactions },
});

export const changeOffers = (offers?: Model.Poi[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_OFFERS,
  payload: { offers },
});

export const changeReservations = (reservations?: Model.UserReservation[]): IAction => ({
  type: TRIP_ACTIONS.CHANGE_RESERVATIONS,
  payload: { reservations },
});

/**
 *
 * Loadings
 *
 */
export const changeLoadingReference = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_REFERENCE,
  payload: { loading },
});

export const changeLoadingPlans = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_PLANS,
  payload: { loading },
});

export const changeLoadingAlternatives = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_ALTERNATIVES,
  payload: { loading },
});

export const changeLoadingFavorites = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_FAVORITES,
  payload: { loading },
});

export const changeLoadingReactions = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_REACTIONS,
  payload: { loading },
});

export const changeLoadingOffers = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_OFFERS,
  payload: { loading },
});

export const changeLoadingReservations = (loading: boolean): IAction => ({
  type: TRIP_ACTIONS.CHANGE_LOADING_RESERVATIONS,
  payload: { loading },
});

/**
 *
 * Notifications
 *
 */
export const saveNotification = (type: Model.NOTIFICATION_TYPE, functionName: string, message: string, closeMs: number = 3500, hide = false): IAction => ({
  type: TRIP_ACTIONS.SAVE_NOTIFICATION,
  payload: { type, functionName, message, closeMs, hide },
});

export const hideNotification = (id: number): IAction => ({
  type: TRIP_ACTIONS.HIDE_NOTIFICATION,
  payload: { id },
});

/**
 *
 * Clear
 *
 */
export const clear = (): IAction => ({
  type: TRIP_ACTIONS.CLEAR,
  payload: null,
});

/**
 *
 *
 *
 * THUNK ACTIONS
 *
 *
 */

/**
 *
 * Relational Data
 *
 */
// export const fetchAlternatives = (dayIndex: number): IThunkResult<Promise<IStepAlternatives[]>> => {
//   return async (dispatch: IThunkDispatch, getState: () => ICombinedState) => {
//     const currentState = getState();
//     const cityId: number | undefined = currentState.trip.reference?.city.id;
//     const { plans } = currentState.trip;

//     if (cityId && plans) {
//       const steps: Model.Step[] = dayIndex > -1 && dayIndex < plans.length ? plans[dayIndex].steps : plans[0].steps;
//       const alternativePoiIds = steps.reduce<number[]>((prev: number[], cur: Model.Step) => prev.concat(cur.alternatives), []);

//       dispatch(changeLoadingAlternatives(true));

//       return api
//         .pois(alternativePoiIds)
//         .then((alternativePois: Model.Poi[]) => {
//           const alternatives: IStepAlternatives[] = [];
//           steps.forEach((s) => {
//             const stepAlternatives: IStepAlternatives = {
//               stepId: s.id,
//               pois: alternativePois.filter((ap) => s.alternatives.includes(ap.id)),
//             };
//             alternatives.push(stepAlternatives);
//           });

//           dispatch(changeAlternatives(alternatives));
//           return alternatives;
//         })
//         .catch((fetchAlternativesError) => {
//           dispatch(saveError('fetchAlternatives', 'Fetch Alternatives', fetchAlternativesError));
//           return fetchAlternativesError;
//         })
//         .finally(() => {
//           dispatch(changeLoadingAlternatives(false));
//         });
//     }

//     // eslint-disable-next-line no-console
//     console.warn('fetchAlternatives called with undefined cityId or plans');
//     return Promise.resolve([]);
//   };
// };

/* export const fetchReactions = (): IThunkResult<Promise<Model.UserReaction[]>> => async (dispatch: IThunkDispatch, getState: () => ICombinedState) => {
  const currentState = getState();
  const tripHash: string | undefined = currentState.trip.reference?.tripHash;

  if (tripHash) {
    dispatch(changeLoadingReactions(true));

    return api
      .reactions(tripHash)
      .then((reactions) => {
        dispatch(changeReactions(reactions));
        return reactions;
      })
      .catch((fetchReactionsError) => {
        dispatch(saveError("fetchReactions", "Fetch Reactions", fetchReactionsError));

        return fetchReactionsError;
      })
      .finally(() => {
        dispatch(changeLoadingReactions(false));
      });
  }

  // eslint-disable-next-line no-console
  console.warn("fetchReactions called with undefined tripHash");
  return Promise.resolve([]);
}; */

/* export const fetchOffers = (): IThunkResult<Promise<Model.Offer[]>> => async (dispatch: IThunkDispatch, getState: () => ICombinedState) => {
  const currentState = getState();
  if (currentState.trip.reference) {
    const dateFrom = moment(currentState.trip.reference.tripProfile.arrivalDatetime).format("YYYY-MM-DD"); //  2023-06-01
    const dateTo = moment(currentState.trip.reference.tripProfile.departureDatetime).format("YYYY-MM-DD"); //  2023-07-01

    dispatch(changeLoadingOffers(true));

    return api
      .offersOptIn(dateFrom, dateTo)
      .then((offers) => {
        dispatch(changeOffers(offers));
        return offers;
      })
      .catch((fetchOffersError) => {
        dispatch(saveError("fetchOffersError", "Fetch Offers", fetchOffersError));

        return fetchOffersError;
      })
      .finally(() => {
        dispatch(changeLoadingOffers(false));
      });
  }

  // eslint-disable-next-line no-console
  console.warn("fetchOffers called with undefined tripReference");
  return Promise.resolve([]);
}; */

// export const fetchFavorites = (): IThunkResult<Promise<IFavoritePoi[]>> => {
//   return async (dispatch: IThunkDispatch, getState: () => ICombinedState) => {
//     const currentState = getState();
//     const cityId: number | undefined = currentState.trip.reference?.city.id;

//     if (cityId) {
//       dispatch(changeLoadingFavorites(true));

//       return api
//         .favorites(cityId)
//         .then((modelFavorites: Model.Favorite[]) => {
//           // Empty favorites
//           if (modelFavorites.length === 0) {
//             dispatch(changeFavorites([]));
//             dispatch(changeLoadingFavorites(false));
//             return [];
//           }

//           const favorites: IFavoritePoi[] = [];
//           const modelFavoriteIds: number[] = modelFavorites.map((mf) => mf.poiId);

//           return api
//             .pois(modelFavoriteIds)
//             .then((modelPois: Model.Poi[]) => {
//               modelFavorites.forEach((mf: Model.Favorite) => {
//                 const favPoi: Model.Poi | undefined = modelPois.find((mp) => mp.id === mf.poiId);

//                 if (favPoi) {
//                   const favoritePoi: IFavoritePoi = {
//                     tripHash: mf.tripHash,
//                     cityId: mf.cityId,
//                     id: mf.id,
//                     poiId: mf.poiId,
//                     poi: favPoi,
//                   };
//                   favorites.push(favoritePoi);
//                 } else {
//                   // eslint-disable-next-line no-console
//                   console.warn('fetchFavorites poi result not found for ', mf.poiId);
//                 }
//               });
//               dispatch(changeFavorites(favorites));
//               return favorites;
//             })
//             .catch((fetchFavoritesPoisError) => {
//               throw fetchFavoritesPoisError;
//             });
//         })
//         .catch((fetchFavoritesError) => {
//           dispatch(saveError('fetchFavorites', 'Fetch Favorites', fetchFavoritesError));
//           return fetchFavoritesError;
//         })
//         .finally(() => {
//           dispatch(changeLoadingFavorites(false));
//         });
//     }

//     // eslint-disable-next-line no-console
//     console.warn('fetchFavorites called with undefined cityId');
//     return Promise.resolve([]);
//   };
// };

/* export const fetchReservations =
  (cityId?: number, from?: string, hash?: string, poiId?: number, provider?: string): IThunkResult<Promise<Model.UserReservation[]>> =>
  async (dispatch: IThunkDispatch) =>
    api
      .reservations(cityId, hash, poiId, provider, from)
      .then((reservations) => {
        dispatch(changeReservations([]));
        if (reservations.length === 0) return [];
        // TODO config.RESTAURANT_RESERVATION_PROVIDER gibi bakmak gerek
        const tripianYelpReservations = reservations.filter((reservation) => reservation.provider === Model.PROVIDER_NAME.YELP);
        if (tripianYelpReservations.length === 0) return [];
        const reservationStatusPromises: Promise<Providers.Yelp.ReservationStatusResponse | undefined>[] = [];
        const allYelpReservations: Model.UserReservation[] = [];
        tripianYelpReservations.forEach((tripianYelpReservation, index) => {
          const reservationPromises = async (userReservation: Model.UserReservation): Promise<Providers.Yelp.ReservationStatusResponse | undefined> => {
            await helper.delay(index * 1000);
            return providers.yelp?.reservationStatus((userReservation.value as Providers.Yelp.ReservationInfo).reservation_id);
          };
          const reservationStatusResponse = reservationPromises(tripianYelpReservation);
          allYelpReservations.push(tripianYelpReservation);
          reservationStatusPromises.push(reservationStatusResponse);
        });
        Promise.all(reservationStatusPromises)
          .then((values: (Providers.Yelp.ReservationStatusResponse | undefined)[]) => {
            values.forEach((value, pIndex) => {
              const currentReservation = allYelpReservations[pIndex];
              const currentReservationInfo = currentReservation.value as Providers.Yelp.ReservationInfo;
              if (value && value.active === false) {
                api.combo
                  .reservationDelete(currentReservation.id, cityId || 0)
                  .then((deleteResponseData) => {
                    dispatch(changeReservations(deleteResponseData));
                  })
                  .catch((reservationError) => {
                    dispatch(saveError("reservationDelete", "Reservation delete ", reservationError));
                  });
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
                api.combo
                  .reservationUpdate(differentReservation, cityId || 0)
                  .then((updateRes) => {
                    dispatch(changeReservations(updateRes));
                  })
                  .catch((reservationError) => {
                    dispatch(saveError("reservationDelete", "Reservation delete ", reservationError));
                  });
              }
            });
            dispatch(changeReservations(allYelpReservations));
          })
          .catch((error) => {
            dispatch(saveError("reservationStatus", "Reservation status error", error));
          });
        return reservations;
      })
      .catch((tripError) => {
        dispatch(saveError("fetchUserReservations", "Get user reservations", tripError));
        // throw new Error(`fetchUserReservations error: ${tripError}`);

        return tripError;
      }); */

/**
 *
 * Trip Data
 *
 */
// export const fetchTrip = (hash: string, minDayIndex: number = 0, showLoading = true, force = false): IThunkResult<Promise<Model.Trip>> => {
//   return async (dispatch: IThunkDispatch) => {
//     if (showLoading) dispatch(changeLoadingReference(true));

//     return api
//       .trip(hash, minDayIndex, force)
//       .then((trip: Model.Trip) => {
//         dispatch(
//           changeReference({
//             id: trip.id,
//             tripHash: trip.tripHash,
//             city: trip.city,
//             trip_profile: trip.tripProfile,
//           }),
//         );

//         dispatch(changePlans(trip.plans));

//         dispatch(fetchAlternatives(minDayIndex));

//         dispatch(fetchReactions());

//         dispatch(fetchFavorites());

//         dispatch(
//           fetchReservations(
//             trip.city.id,
//             moment()
//               .subtract(1, 'days')
//               .format('YYYY-MM-DD'),
//           ),
//         );

//         return trip;
//       })
//       .catch((tripError) => {
//         dispatch(saveError('fetchTrip', 'Get user trip', tripError));
//         return tripError;
//       })
//       .finally(() => {
//         if (showLoading) dispatch(changeLoadingReference(false));
//       });
//   };
// };
