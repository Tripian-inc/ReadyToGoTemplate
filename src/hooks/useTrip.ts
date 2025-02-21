import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as ROUTER_PATH_TITLE from "../constants/ROUTER_PATH_TITLE";
import Model, { helper } from "@tripian/model";
import { api } from "@tripian/core";
import {
  changeLoadingPlans,
  changeLoadingReference,
  changePlans,
  changeReadOnly,
  changeReference,
  // fetchAlternatives,
  // fetchReactions,
  // fetchReservations,
  clear,
  saveNotification,
} from "../redux/action/trip";
import useUser from "./useUser";
import ICombinedState from "../redux/model/ICombinedState";
import { useHistory } from "react-router";
import { changeTripReferences } from "../redux/action/user";

const useTrip = () => {
  const [loadingTripAdd, setLoadingTripAdd] = useState<boolean>(false);
  const [loadingTripUpdate, setLoadingTripUpdate] = useState<boolean>(false);
  const [loadingTripNameUpdate, setLoadingTripNameUpdate] = useState<boolean>(false);
  const [loadingTripDelete, setLoadingTripDelete] = useState<boolean>(false);

  const { loadingTripReference, tripReference, tripReadOnly, tripReferences } = useSelector((state: ICombinedState) => ({
    loadingTripReference: state.trip.loading.reference,
    tripReference: state.trip.reference,
    tripReadOnly: state.trip.readOnly,
    tripReferences: state.user.tripReferences,
  }));
  const dispatch = useDispatch();
  const history = useHistory();
  const { userTripReferencesFetch } = useUser();

  const tripAdd = useCallback(
    (tripProfile: Model.TripProfile, minDayIndex = 0): Promise<Model.Trip> => {
      setLoadingTripAdd(true);

      return api
        .tripAdd(tripProfile, minDayIndex)
        .then(async (trip: Model.Trip) => {
          await userTripReferencesFetch();
          return trip;
        })

        .catch((tripAddError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripAdd", "Add Trip", tripAddError));
          throw tripAddError;
        })
        .finally(() => {
          setLoadingTripAdd(false);
        });
    },
    [dispatch, userTripReferencesFetch]
  );

  const tripUpdate = useCallback(
    (tripHash: string, tripProfile: Model.TripProfile, minDayIndex = 0): Promise<Model.Trip> => {
      setLoadingTripUpdate(true);

      return api
        .tripUpdate(tripHash, tripProfile, minDayIndex)
        .then(async (trip: Model.Trip) => {
          await userTripReferencesFetch();
          return trip;
        })

        .catch((tripUpdateError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripUpdate", "Update Trip", tripUpdateError));
          throw tripUpdateError;
        })
        .finally(() => {
          setLoadingTripUpdate(false);
        });
    },
    [dispatch, userTripReferencesFetch]
  );

  const tripNameUpdate = useCallback(
    (tripHash: string, tripProfile: Model.TripProfile, minDayIndex = 0): Promise<void> => {
      setLoadingTripNameUpdate(true);

      return api
        .tripNameUpdate(tripHash, tripProfile)
        .then((tripData: Model.Trip) => {
          const references = helper.deepCopy(tripReferences);
          if (references) {
            const referenceIndex = references?.findIndex((ref) => ref.tripHash === tripHash);
            if (referenceIndex !== -1) {
              references[referenceIndex] = {
                ...references[referenceIndex],
                tripProfile: tripData.tripProfile,
              };
              dispatch(changeTripReferences(references));
            }
          }
        })
        .catch((tripUpdateError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripNameUpdate", "Update Trip Name", tripUpdateError));
          throw tripUpdateError;
        })
        .finally(() => {
          setLoadingTripNameUpdate(false);
        });
    },
    [dispatch, tripReferences]
  );

  const tripDelete = useCallback(
    (tripHash: string): Promise<number> => {
      setLoadingTripDelete(true);

      return api
        .tripDelete(tripHash)
        .then(async (deletedTripId: number) => {
          await userTripReferencesFetch();
          return deletedTripId;
        })

        .catch((tripDeleteError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripDelete", "Delete Trip", tripDeleteError));
          throw tripDeleteError;
        })
        .finally(() => {
          setLoadingTripDelete(false);
        });
    },
    [dispatch, userTripReferencesFetch]
  );

  const tripFetchCallback = useCallback(
    (tripData: Model.Trip, readOnly: boolean = false) => {
      dispatch(
        changeReference({
          id: tripData.id,
          tripHash: tripData.tripHash,
          city: tripData.city,
          tripProfile: tripData.tripProfile,
          shared: tripData.shared,
        })
      );
      dispatch(changePlans(tripData.plans));
      dispatch(changeReadOnly(readOnly));
    },
    [dispatch]
  );

  const tripFetch = useCallback(
    (hash: string, minDayIndex = 0, force = false): Promise<Model.Trip> => {
      dispatch(changeLoadingReference(true));
      dispatch(changeLoadingPlans(true));

      return api
        .trip(hash, minDayIndex, force)
        .then((trip: Model.Trip) => {
          tripFetchCallback(trip);
          return trip;
        })

        .catch((tripFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripFetch", "Get Trip", tripFetchError));
          history.push(ROUTER_PATH_TITLE.TRIPS.PATH);
          throw tripFetchError;
        })
        .finally(() => {
          dispatch(changeLoadingReference(false));
          dispatch(changeLoadingPlans(false));
        });
    },
    [history, dispatch, tripFetchCallback]
  );

  const tripGetShared = useCallback(
    (hash: string): Promise<Model.Trip> => {
      dispatch(changeLoadingReference(true));
      dispatch(changeLoadingPlans(true));

      return api
        .tripGetShared(hash, !window.tconfig.WIDGET_THEME_1)
        .then((trip: Model.Trip) => {
          tripFetchCallback(trip, true);
          return trip;
        })

        .catch((tripFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripGetShared", "Get Trip Shared", tripFetchError));
          history.push(ROUTER_PATH_TITLE.TRIPS.PATH);
          throw tripFetchError;
        })
        .finally(() => {
          dispatch(changeLoadingReference(false));
          dispatch(changeLoadingPlans(false));
        });
    },
    [history, dispatch, tripFetchCallback]
  );

  const tripShare = useCallback(
    (tripHash: string, shared: boolean): Promise<boolean> =>
      api
        .tripShare(tripHash, shared)
        // .then((value) => {
        //   return value;
        // })

        .catch((tripSharedError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripShareError", "Update Trip Shared", tripSharedError));
          throw tripSharedError;
        })
        .finally(() => {}),
    [dispatch]
  );

  // const tripFetchWithRelational = async (hash: string, minDayIndex: number = 0, force = false): Promise<Model.Trip> => {
  //   const trip = await tripFetch(hash, minDayIndex, force);
  //   dispatch(fetchAlternatives(minDayIndex));
  //   dispatch(fetchReactions());
  //   dispatch(fetchFavorites());
  //   dispatch(
  //     fetchReservations(
  //       trip.city.id,
  //       moment()
  //         .subtract(1, 'days')
  //         .format('YYYY-MM-DD'),
  //     ),
  //   );
  //   return trip;
  // };

  const tripReferenceFetch = useCallback(
    (hash: string): Promise<Model.TripReference> =>
      api
        .tripRef(hash)
        // .then((tripReferenceData: Model.TripReference) => {
        //   return tripReferenceData;
        // })

        .catch((tripReferenceFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tripReferenceFetch", "Get Trip", tripReferenceFetchError));
          throw tripReferenceFetchError;
        })
        .finally(() => {}),
    [dispatch]
  );

  const tripClear = useCallback(() => {
    dispatch(clear());
  }, [dispatch]);

  /* console.log("loadingTripUpdate-0", loadingTripUpdate); */
  return {
    loadingTripReference,
    loadingTripAdd,
    loadingTripUpdate,
    loadingTripNameUpdate,
    loadingTripDelete,
    tripReference,
    tripReadOnly,
    tripAdd,
    tripUpdate,
    tripNameUpdate,
    tripDelete,
    tripFetch /* , tripFetchWithRelational */,
    tripGetShared,
    tripShare,
    tripFetchCallback,
    tripReferenceFetch,
    tripClear,
  };
};

export default useTrip;
