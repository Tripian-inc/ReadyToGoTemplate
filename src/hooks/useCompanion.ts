import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import ICombinedState from "../redux/model/ICombinedState";
import { changeCompanions, changeLoadingCompanions, saveNotification } from "../redux/action/user";

const useCompanion = () => {
  const [loading, setLoading] = useState<{ add: boolean; update: number[]; delete: number[] }>({
    add: false,
    update: [],
    delete: [],
  });
  const { loadingCompanions, companions } = useSelector((state: ICombinedState) => ({
    loadingCompanions: state.user.loading.companions,
    companions: state.user.companions,
  }));
  const dispatch = useDispatch();

  const loadingCompanionAdd = useMemo(() => loading.add, [loading.add]);

  const companionUpdateLoadingList = useMemo(() => loading.update, [loading.update]);
  const companionDeleteLoadingList = useMemo(() => loading.delete, [loading.delete]);

  const companionAdd = useCallback(
    (companionRequest: Model.CompanionRequest): Promise<Model.Companion[]> => {
      setLoading((prevLoading) => ({ ...prevLoading, add: true }));

      return api.combo
        .companionAdd(companionRequest)
        .then((companionsData: Model.Companion[]) => {
          dispatch(changeCompanions(companionsData));
          return companionsData;
        })

        .catch((companionAddError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "companionAdd", "Add Companion", companionAddError));
          throw companionAddError;
        })
        .finally(() => {
          setLoading((prevLoading) => ({ ...prevLoading, add: false }));
        });
    },
    [dispatch]
  );

  const companionUpdate = useCallback(
    (companion: Model.Companion): Promise<Model.Companion[]> => {
      setLoading((prevLoading) => ({ ...prevLoading, update: [...prevLoading.update, companion.id] }));

      return api.combo
        .companionUpdate(companion)
        .then((companionsData: Model.Companion[]) => {
          dispatch(changeCompanions(companionsData));
          return companionsData;
        })

        .catch((companionUpdateError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "companionUpdate", "Update Companion", companionUpdateError));
          throw companionUpdateError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, update: [...prevLoading.update] };
            const index = newState.update.indexOf(companion.id);
            if (index > -1) newState.update.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch]
  );

  const companionDelete = useCallback(
    (companionId: number): Promise<Model.Companion[]> => {
      setLoading((prevLoading) => ({ ...prevLoading, delete: [...prevLoading.delete, companionId] }));

      return api.combo
        .companionDelete(companionId)
        .then((companionsData: Model.Companion[]) => {
          dispatch(changeCompanions(companionsData));
          return companionsData;
        })

        .catch((companionDeleteError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "companionDelete", "Delete Companion", companionDeleteError));
          throw companionDeleteError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, delete: [...prevLoading.delete] };
            const index = newState.delete.indexOf(companionId);
            if (index > -1) newState.delete.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch]
  );

  const companionsFetch = useCallback(
    (force = false): Promise<Model.Companion[]> => {
      dispatch(changeLoadingCompanions(true));

      return api
        .companions(force)
        .then((companionsData: Model.Companion[]) => {
          dispatch(changeCompanions(companionsData));
          return companionsData;
        })

        .catch((companionsFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "companionsFetch", "Fetch User Companions", companionsFetchError));
          throw companionsFetchError;
        })
        .finally(() => {
          dispatch(changeLoadingCompanions(false));
        });
    },
    [dispatch]
  );

  return {
    loadingCompanions,
    loadingCompanionAdd,
    companionUpdateLoadingList,
    companionDeleteLoadingList,
    companions,
    companionAdd,
    companionUpdate,
    companionDelete,
    companionsFetch,
  };
};

export default useCompanion;
