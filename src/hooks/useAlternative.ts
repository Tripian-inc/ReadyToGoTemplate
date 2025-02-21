import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";

import ICombinedState from "../redux/model/ICombinedState";
import IStepAlternatives from "../models/IStepAlternatives";
import { changeAlternatives, changeLoadingAlternatives, saveNotification } from "../redux/action/trip";
import { useParams } from "react-router";

const useAlternative = () => {
  const { plans, alternatives, loadingAlternatives } = useSelector((state: ICombinedState) => ({
    plans: state.trip?.plans,
    alternatives: state.trip.alternatives,
    loadingAlternatives: state.trip.loading.alternatives,
  }));
  const dispatch = useDispatch();

  const { hashParam } = useParams<{ hashParam: string }>();

  const shared = useMemo(() => {
    const params = hashParam.split("!");
    return params.length > 1 && hashParam.split("!")[1] === "s";
  }, [hashParam]);

  const alternativesFetch = useCallback(
    (dayIndex: number): Promise<IStepAlternatives[]> => {
      if (plans === undefined) {
        // eslint-disable-next-line no-console
        console.warn("alternativesFetch called with undefined plans");
        dispatch(changeAlternatives([]));
        return Promise.resolve([]);
      }

      const steps: Model.Step[] = dayIndex > -1 && dayIndex < plans.length ? plans[dayIndex].steps : plans[0].steps;
      if (steps.length === 0) {
        dispatch(changeAlternatives([]));
        return Promise.resolve([]);
      }

      const alternativePoiIds = steps.reduce<string[]>((prev: string[], cur: Model.Step) => prev.concat(cur.alternatives), []);
      if (alternativePoiIds.length === 0) {
        dispatch(changeAlternatives([]));
        return Promise.resolve([]);
      }

      dispatch(changeLoadingAlternatives(true));
      return api
        .pois(alternativePoiIds, Number(!shared))
        .then((alternativePois: Model.Poi[]) => {
          const newAternatives: IStepAlternatives[] = [];
          steps.forEach((s) => {
            const stepAlternatives: IStepAlternatives = {
              stepId: s.id,
              pois: alternativePois.filter((ap) => s.alternatives.includes(ap.id)),
            };
            newAternatives.push(stepAlternatives);
          });

          dispatch(changeAlternatives(newAternatives));
          return newAternatives;
        })

        .catch((alternativesFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "alternativesFetch", "Fetch Alternatives", alternativesFetchError));
          throw alternativesFetchError;
        })
        .finally(() => {
          dispatch(changeLoadingAlternatives(false));
        });
    },
    [dispatch, plans, shared]
  );

  return { alternatives, alternativesFetch, loadingAlternatives };
};

export default useAlternative;
