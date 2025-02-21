import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useToristyInfo = () => {
  const [loadingToristyInfo, setLoadingToristyInfo] = useState<boolean>(false);
  const [toristyInfo, setToristyInfo] = useState<Providers.Toristy.ProductDetailsResponse>();

  const dispatch = useDispatch();

  const fetchToristyInfo = useCallback(
    (productCode: string): Promise<Boolean> => {
      if (providers.toristy && window.tconfig.SHOW_TOURS_AND_TICKETS && window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.TORISTY)) {
        setLoadingToristyInfo(true);
        setToristyInfo(undefined);

        return providers.toristy
          .serviceDetails(productCode)
          .then((data: Providers.Toristy.ProductDetailsResponse) => {
            setToristyInfo(data);
            return true;
          })
          .catch((toristyFetchProductInfoError) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "toristyFetchTourError", toristyFetchProductInfoError));
            setLoadingToristyInfo(false);
            return false;
          })
          .finally(() => {
            setLoadingToristyInfo(false);
          });
      }
      return Promise.resolve(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  return {
    fetchToristyInfo,
    loadingToristyInfo,
    toristyInfo,
  };
};

export default useToristyInfo;
