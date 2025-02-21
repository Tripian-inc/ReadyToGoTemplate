import { useCallback, useMemo, useState } from "react";
import { api } from "@tripian/core";
import { useDispatch } from "react-redux";
import Model from "@tripian/model";
import useTrip from "./useTrip";
import { saveNotification } from "../redux/action/user";

const useSearchPoi = () => {
  const { tripReference } = useTrip();

  const [loadingTastePois, setLoadingTastePois] = useState<boolean>(false);
  const [tastePois, setTastePois] = useState<Model.Poi[]>([]);

  const dispatch = useDispatch();

  const cityId: number | undefined = useMemo(() => {
    if (tripReference?.city) {
      if (tripReference.city.locationType !== "city") {
        const parentCityId = tripReference.city.parentLocations.find((p) => p.locationType === "city")?.id;
        if (parentCityId) return parentCityId;
      }

      return tripReference.city.id;
    }
    return undefined;
  }, [tripReference?.city]);

  const searchPoi = useCallback(
    (query: string, searchPoiCategories?: number[], showOffersOnly?: boolean, page?: number) =>
      api.poisNameSearch({ cityId: cityId, search: query, poiCategories: searchPoiCategories?.join(","), showOffersOnly, limit: 20, page }),
    [cityId]
  );

  const openSearchPoi = useCallback(
    (query: string[], searchPoiCategories?: number[], showOffersOnly?: boolean, page?: number) => {
      return api.poisOpenSearch({ cityId: cityId, search: query.join("|"), poiCategories: searchPoiCategories?.join(","), showOffersOnly, limit: 20, page });
    },
    [cityId]
  );

  const searchPoiAutoComplete = useCallback(() => api.poisSearchAutoComplete(), []);

  const searchPoiAutoCompleteTags = useCallback(
    (searchPoiCategories?: number[]) => api.poisSearchAutoCompleteTags(cityId || 0, searchPoiCategories && searchPoiCategories?.join(",")),
    [cityId]
  );

  const tastePoisFetch = useCallback(
    (tasteId: number): Promise<Model.Poi[]> => {
      setLoadingTastePois(true);

      return api
        .poisMustTrySearch({ cityId: cityId ?? 0, mustTryIds: tasteId.toString(), limit: 100 })
        .then((tastePoisResponse) => {
          setTastePois(tastePoisResponse);
          return tastePoisResponse;
        })

        .catch((tastePoisFetchError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "tastePoisFetch", "Taste Pois Fetch", tastePoisFetchError));
          throw tastePoisFetchError;
        })
        .finally(() => {
          setLoadingTastePois(false);
        });
    },
    [dispatch, cityId]
  );

  return { searchPoi, openSearchPoi, searchPoiAutoComplete, searchPoiAutoCompleteTags, tastePoisFetch, tastePois, loadingTastePois };
};

export default useSearchPoi;
