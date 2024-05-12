import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import ICombinedState from "../redux/model/ICombinedState";
import { changeReactions, changeLoadingReactions, saveNotification } from "../redux/action/trip";

const useReaction = () => {
  const [loading, setLoading] = useState<{ add: number[]; delete: number[] }>({ add: [], delete: [] });
  const { tripHash, reactions, loadingReactions, readOnlyTrip } = useSelector((state: ICombinedState) => ({
    tripHash: state.trip?.reference?.tripHash,
    reactions: state.trip.reactions,
    loadingReactions: state.trip.loading.reactions,
    readOnlyTrip: state.trip.readOnly,
  }));
  const dispatch = useDispatch();

  const loadingReactionStep = useCallback((stepId: number) => loading.add.includes(stepId) || loading.delete.includes(stepId), [loading.add, loading.delete]);

  const loadingReactionStepList = useMemo(() => loading.add.concat(loading.delete), [loading.add, loading.delete]);

  const reactionsFetch = useCallback((): Promise<Model.UserReaction[] | undefined> => {
    if (tripHash === undefined || readOnlyTrip === true) {
      // eslint-disable-next-line no-console
      console.warn("fetchReaction called with undefined tripHash");
      return Promise.resolve(undefined);
    }
    dispatch(changeLoadingReactions(true));

    return api
      .reactions(tripHash)
      .then((userReactions: Model.UserReaction[]) => {
        // Empty reactions
        // if (userReactions.length === 0) {
        //   dispatch(changeReactions([]));
        //   return [];
        // }

        dispatch(changeReactions(userReactions));
        return userReactions;
      })

      .catch((reactionsFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reactionsFetch", "Fetch Reactions", reactionsFetchError));
        throw reactionsFetchError;
      })
      .finally(() => {
        dispatch(changeLoadingReactions(false));
      });
  }, [dispatch, readOnlyTrip, tripHash]);

  const reactionAdd = useCallback(
    (reactionRequest: Model.UserReactionRequest): Promise<Model.UserReaction> => {
      setLoading((prevLoading) => ({ ...prevLoading, add: [...prevLoading.add, reactionRequest.stepId || 0] }));
      return api
        .reactionAdd(reactionRequest)
        .then((reactionResponse: Model.UserReaction) => reactionsFetch().then(() => reactionResponse))

        .catch((reactionAddError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reactionAdd", "Add Reaction", reactionAddError));
          throw reactionAddError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, add: [...prevLoading.add] };
            const index = newState.add.indexOf(reactionRequest.stepId || 0);
            if (index > -1) newState.add.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, reactionsFetch]
  );

  const reactionDelete = useCallback(
    (reactionId: number, stepId: number): Promise<number> => {
      setLoading((prevLoading) => ({ ...prevLoading, delete: [...prevLoading.delete, stepId] }));

      return api
        .reactionDelete(reactionId)
        .then((deletedReactionId: number) => reactionsFetch().then(() => deletedReactionId))

        .catch((reactionDeleteError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "reactionDelete", "Delete Reaction", reactionDeleteError));
          throw reactionDeleteError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, delete: [...prevLoading.delete] };
            const index = newState.delete.indexOf(stepId);
            if (index > -1) newState.delete.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, reactionsFetch]
  );

  useEffect(() => {
    if (reactions === undefined && loadingReactions === false && tripHash !== undefined) reactionsFetch();
  }, [loadingReactions, reactions, reactionsFetch, tripHash]);

  return { reactions, loadingReactions, loadingReactionStep, loadingReactionStepList, reactionsFetch, reactionAdd, reactionDelete };
};

export default useReaction;
