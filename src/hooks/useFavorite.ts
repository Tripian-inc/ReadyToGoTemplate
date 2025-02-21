import { useState, useCallback /* , useEffect */, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import ICombinedState from "../redux/model/ICombinedState";
import { changeFavorites, changeLoadingFavorites, saveNotification } from "../redux/action/trip";
import IFavoritePoi from "../models/IFavoritePoi";
import { useParams } from "react-router";

const useFavorite = () => {
  const [loading, setLoading] = useState<{ add: string[]; delete: string[] }>({ add: [], delete: [] });
  const { tripHash, cityId, favorites, loadingFavorites, readOnlyTrip } = useSelector((state: ICombinedState) => ({
    tripHash: state.trip?.reference?.tripHash,
    cityId: state.trip.reference?.city.id,
    favorites: state.trip.favorites,
    loadingFavorites: state.trip.loading.favorites,
    readOnlyTrip: state.trip.readOnly,
  }));
  const dispatch = useDispatch();

  const { hashParam } = useParams<{ hashParam: string }>();

  const shared = useMemo(() => {
    const params = hashParam.split("!");
    return params.length > 1 && hashParam.split("!")[1] === "s";
  }, [hashParam]);

  // if (tripHash === undefined) console.warn('useFavorite called with undefined tripHash'); // eslint-disable-line no-console

  // const loadingFavoriteAdd = (poiId: number) => loading.add.includes(poiId);
  // const loadingFavoriteDelete = (poiId: number) => loading.delete.includes(poiId);
  const loadingFavoritePoi = useCallback((poiId: string) => loading.add.includes(poiId) || loading.delete.includes(poiId), [loading.add, loading.delete]);

  const favoritesFetch = useCallback((): Promise<IFavoritePoi[]> => {
    if (cityId === undefined || readOnlyTrip === true) {
      // eslint-disable-next-line no-console
      console.warn("fetchFavorites called with undefined cityId");
      return Promise.resolve([]);
    }
    dispatch(changeLoadingFavorites(true));

    return api
      .favorites(cityId)
      .then((modelFavorites: Model.Favorite[]) => {
        // Empty favorites
        if (modelFavorites.length === 0) {
          dispatch(changeFavorites([]));
          return [];
        }

        const favoritesResult: IFavoritePoi[] = [];
        const modelFavoriteIds: string[] = modelFavorites.map((mf) => mf.poiId);

        return api
          .pois(modelFavoriteIds, Number(!shared))
          .then((modelPois: Model.Poi[]) => {
            modelFavorites.forEach((mf: Model.Favorite) => {
              const favPoi: Model.Poi | undefined = modelPois.find((mp) => mp.id === mf.poiId);

              if (favPoi) {
                const favoritePoi: IFavoritePoi = {
                  tripHash: mf.tripHash,
                  cityId: mf.cityId,
                  id: mf.id,
                  poiId: mf.poiId,
                  poi: favPoi,
                };
                favoritesResult.push(favoritePoi);
              } else {
                // eslint-disable-next-line no-console
                console.warn("favoritesFetch poi result not found for ", mf.poiId);
              }
            });

            dispatch(changeFavorites(favoritesResult));
            return favoritesResult;
          })

          .catch((favoritesFetchPoisError) => {
            throw favoritesFetchPoisError;
          });
      })

      .catch((favoritesFetchError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "favoritesFetch", "Fetch Favorites", favoritesFetchError));
        throw favoritesFetchError;
      })
      .finally(() => {
        dispatch(changeLoadingFavorites(false));
      });
  }, [cityId, dispatch, readOnlyTrip, shared]);

  const favoriteAdd = useCallback(
    (poiId: string): Promise<Model.Favorite> => {
      setLoading((prevLoading) => ({ ...prevLoading, add: [...prevLoading.add, poiId] }));

      return api
        .favoriteAdd(poiId, tripHash)
        .then((favorite: Model.Favorite) => favoritesFetch().then(() => favorite))

        .catch((favoriteAddError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "favoriteAdd", "Add Favorite", favoriteAddError));
          throw favoriteAddError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, add: [...prevLoading.add] };
            const index = newState.add.indexOf(poiId);
            if (index > -1) newState.add.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, favoritesFetch, tripHash]
  );

  const favoriteDelete = useCallback(
    (favoriteId: number, poiId: string): Promise<number> => {
      setLoading((prevLoading) => ({ ...prevLoading, delete: [...prevLoading.delete, poiId] }));

      return api
        .favoriteDelete(favoriteId)
        .then((deletedFavoriteId: number) => favoritesFetch().then(() => deletedFavoriteId))

        .catch((favoriteDeleteError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "favoriteDelete", "Delete Favorite", favoriteDeleteError));
          throw favoriteDeleteError;
        })
        .finally(() => {
          setLoading((prevLoading) => {
            const newState = { ...prevLoading, delete: [...prevLoading.delete] };
            const index = newState.delete.indexOf(poiId);
            if (index > -1) newState.delete.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, favoritesFetch]
  );

  /* useEffect(() => {
    if (favorites === undefined && loadingFavorites === false && cityId !== undefined) favoritesFetch();
  }, [favoritesFetch, favorites, loadingFavorites, cityId]); */

  return { cityId, favorites, loadingFavorites, loadingFavoritePoi, favoritesFetch, favoriteAdd, favoriteDelete };
};

export default useFavorite;
