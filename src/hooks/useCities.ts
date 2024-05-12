import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useCities = () => {
  const [loadingCities, setLoadingCities] = useState<boolean>(true);
  const [cities, setCities] = useState<Model.City[]>();

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .citiesAll()
      .then((citiesAllData: Model.City[]) => {
        setCities(citiesAllData);
        return citiesAllData;
      })
      .catch((citiesAllError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "citiesAll", "Fetch Cities", citiesAllError));
        throw citiesAllError;
      })
      .finally(() => {
        setLoadingCities(false);
      });
  }, [dispatch]);

  return { loadingCities, cities };
};

export default useCities;
