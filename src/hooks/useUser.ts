import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { useCallback } from "react";
import { changeLoadingTripReferences, changeLoadingUser, changeTripReferences, changeUser, saveNotification } from "../redux/action/user";
import ICombinedState from "../redux/model/ICombinedState";

const useUser = () => {
  const { loadingUser, loadingTripReferences, user, tripReferences } = useSelector((state: ICombinedState) => ({
    loadingUser: state.user.loading.user,
    user: state.user.user,
    tripReferences: state.user.tripReferences,
    loadingTripReferences: state.user.loading.tripReferences,
  }));
  const dispatch = useDispatch();

  const userFetch = useCallback((): Promise<Model.User> => {
    dispatch(changeLoadingUser(true));

    return api
      .user()
      .then((userData: Model.User) => {
        dispatch(changeUser(userData));
        return userData;
      })

      .catch((userFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "userFetch", "Fetch User", userFetchError));
        throw userFetchError;
      })
      .finally(() => {
        dispatch(changeLoadingUser(false));
      });
  }, [dispatch]);

  const userTripReferencesFetch = useCallback((): Promise<Model.TripReference[]> => {
    dispatch(changeLoadingTripReferences(true));

    return api
      .tripRefs()
      .then((tripReferencesData: Model.TripReference[]) => {
        dispatch(changeTripReferences(tripReferencesData));
        return tripReferencesData;
      })

      .catch((userTripReferencesFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "userTripReferencesFetch", "Fetch User Trips", userTripReferencesFetchError));
        throw userTripReferencesFetchError;
      })
      .finally(() => {
        dispatch(changeLoadingTripReferences(false));
      });
  }, [dispatch]);

  return {
    loadingUser,
    loadingTripReferences,
    user,
    tripReferences,
    userFetch,
    userTripReferencesFetch,
  };
};

export default useUser;
