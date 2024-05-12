import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";

import ICombinedState from "../redux/model/ICombinedState";
import { changeLoadingPlans, changePlans, changePlan, saveNotification } from "../redux/action/trip";

const usePlan = () => {
  const [loadingPlan, changeLoadingPlan] = useState<boolean>(false);
  const { tripHash, loadingPlans, plans } = useSelector((state: ICombinedState) => ({
    tripHash: state.trip?.reference?.tripHash,
    loadingPlans: state.trip.loading.plans,
    plans: state.trip.plans,
  }));
  const dispatch = useDispatch();

  const planDay = useCallback((dayIndex: number) => (plans && plans.length > dayIndex && dayIndex > -1 ? plans[dayIndex] : undefined), [plans]);

  const planFetch = useCallback(
    (planId: number): Promise<Model.Plan> => {
      changeLoadingPlan(true);

      return api
        .plan(planId)
        .then((updatedPlan: Model.Plan) => {
          dispatch(changePlan(updatedPlan));
          return updatedPlan;
        })

        .catch((planFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "planFetch", "Fetch Plan", planFetchError));
          throw planFetchError;
        })
        .finally(() => {
          changeLoadingPlan(false);
        });
    },
    [dispatch]
  );

  const planUpdateOrders = useCallback(
    (planId: number, orders: number[]): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .planUpdateOrders(planId, orders, tripHash || "")
        .then((trip: Model.Trip) => {
          dispatch(changePlans(trip.plans));

          return trip.plans;
        })

        .catch((planUpdateOrdersError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "planUpdateOrders", "Sort Places Manually", planUpdateOrdersError));
          throw planUpdateOrdersError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  const planUpdateTime = useCallback(
    (planId: number, startTime: string, endTime: string): Promise<Model.Plan[]> => {
      dispatch(changeLoadingPlans(true));

      return api.combo
        .planUpdateTime(planId, startTime, endTime, tripHash || "")
        .then((trip: Model.Trip) => {
          dispatch(changePlans(trip.plans));

          return trip.plans;
        })

        .catch((planUpdateTimeError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "planUpdateTime", "Update Plan Time", planUpdateTimeError));
          throw planUpdateTimeError;
        })
        .finally(() => {
          dispatch(changeLoadingPlans(false));
        });
    },
    [dispatch, tripHash]
  );

  return { loadingPlans, loadingPlan, plans, planDay, planUpdateOrders, planUpdateTime, changePlans, changePlan, planFetch };
};

export default usePlan;
