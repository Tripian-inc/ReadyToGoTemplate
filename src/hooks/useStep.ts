import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";

import ICombinedState from "../redux/model/ICombinedState";
import { changeAlternatives, changeLoadingPlans, changePlans, saveNotification } from "../redux/action/trip";

const useStep = () => {
  const tripHash = useSelector((state: ICombinedState) => state.trip?.reference?.tripHash);
  const dispatch = useDispatch();

  const stepAdd = useCallback(
    (planId: number, poiId: string, startTime?: string, endTime?: string): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .stepAdd(planId, poiId, tripHash || "", startTime, endTime)
        .then((trip: Model.Trip) => {
          dispatch(changePlans(trip.plans));
          return trip.plans;
        })

        .catch((stepAddError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "stepAdd", "Add Place To Plan", stepAddError));
          throw stepAddError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  const customStepAdd = useCallback(
    (planId: number, customPoi: Model.CustomPoi, stepType: string, startTime?: string, endTime?: string): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .customStepAdd(planId, customPoi, tripHash || "", stepType, startTime, endTime)
        .then((trip: Model.Trip) => {
          dispatch(changePlans(trip.plans));
          return trip.plans;
        })

        .catch((stepAddError) => {
          // dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "customStepAdd", "Add Place To Plan", stepAddError));
          throw stepAddError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  const stepReplace = useCallback(
    (stepId: number, alternativePoiId: string): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .stepReplace(stepId, alternativePoiId, tripHash || "")
        .then((trip: Model.Trip) => {
          dispatch(changeAlternatives(undefined));
          dispatch(changePlans(trip.plans));
          return trip.plans;
        })

        .catch((stepReplaceError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "stepReplace", "Replace Place", stepReplaceError));
          throw stepReplaceError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  const stepUpdateTimes = useCallback(
    (stepId: number, startTime: string, endTime: string): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .stepUpdateTimes(stepId, startTime, endTime, tripHash || "")
        .then((trip: Model.Trip) => {
          dispatch(changePlans(trip.plans));
          return trip.plans;
        })

        .catch((stepUpdateTimesError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "stepUpdateTimes", "Update Times", stepUpdateTimesError));
          throw stepUpdateTimesError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  const stepDelete = useCallback(
    (stepId: number): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .stepDelete(stepId, tripHash || "")
        .then((trip: Model.Trip) => {
          dispatch(changeAlternatives(undefined));
          dispatch(changePlans(trip.plans));
          return trip.plans;
        })

        .catch((stepDeleteError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "stepDelete", "Delete Place", stepDeleteError));
          throw stepDeleteError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  return { stepAdd, customStepAdd, stepReplace, stepUpdateTimes, stepDelete };
};

export default useStep;
