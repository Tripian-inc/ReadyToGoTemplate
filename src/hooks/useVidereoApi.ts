import { useCallback, useEffect, useState } from "react";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { useDispatch } from "react-redux";
import { saveNotification } from "../redux/action/trip";

const useVidereoApi = (cityId: number) => {
  const [loadingVidereoVideos, setLoadingVidereoVideos] = useState<boolean>(false);
  const [videreoVideos, setVidereoVideos] = useState<Providers.Videreo.ResponseResult[]>([]);

  const dispatch = useDispatch();

  const fetchProducts = useCallback(() => {
    if (cityId === 659 && window.location.hostname === "trial-dev.tripian.com") {
      setLoadingVidereoVideos(true);
      setVidereoVideos([]);

      providers.videreo
        ?.searchVideos()
        .then((videos: Providers.Videreo.ResponseResult[]) => {
          if (videos) {
            setVidereoVideos(videos);
          }
        })
        .catch((videreoFetchVideosError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "videreoFetchVideosError", videreoFetchVideosError));
        })
        .finally(() => {
          setLoadingVidereoVideos(false);
        });
    }
  }, [cityId, dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { loadingVidereoVideos, videreoVideos };
};

export default useVidereoApi;
