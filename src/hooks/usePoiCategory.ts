import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const usePoiCategory = () => {
  const [loadingPoiCategories, setLoadingPoiCategories] = useState<boolean>(true);
  const [poiCategoryGroups, setPoiCategoryGroups] = useState<Model.PoiCategoryGroup[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .poiCategories()
      .then((pCategories: Model.PoiCategoryResponse) => {
        setPoiCategoryGroups(pCategories.groups);
      })

      .catch((poiCategoriesError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "poiCategories", "Fetch Poi categories", poiCategoriesError));
        throw poiCategoriesError;
      })
      .finally(() => {
        setLoadingPoiCategories(false);
      });
  }, [dispatch]);

  return { poiCategoryGroups, loadingPoiCategories };
};

export default usePoiCategory;
