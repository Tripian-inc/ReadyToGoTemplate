import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model, { Providers } from "@tripian/model";

import IFocusState from "../redux/model/IFocusState";
import ICombinedState from "../redux/model/ICombinedState";
import {
  changeFocusedStep,
  changeFocusedAlternative,
  changeFocusedPoi,
  clearFocus,
  changeFocusedProviderPoi,
  changeFocusedCarRentOffer,
  changeFocusedProviderTour,
  changeFocusedProviderVideo,
  changeFocusedProviderEvent,
} from "../redux/action/focus";
import gmapGlobal from "../redux/gmapGlobal";

const useFocus = () => {
  const focus: IFocusState = useSelector((state: ICombinedState) => state.focus);

  const dispatch = useDispatch();

  const focusStep = useCallback(
    (step: Model.Step) => {
      dispatch(changeFocusedStep(step));

      gmapGlobal.setGmapCenter(step.poi.coordinate);
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusAlternative = useCallback(
    (stepId: number, poi: Model.Poi) => {
      dispatch(changeFocusedAlternative(stepId, poi));

      gmapGlobal.setGmapCenter(poi.coordinate);
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusPoi = useCallback(
    (poi: Model.Poi) => {
      dispatch(changeFocusedPoi(poi));

      gmapGlobal.setGmapCenter(poi.coordinate);
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusProviderPoi = useCallback(
    (providerPoi: Providers.Bb.SearchAccommodationHotelOffer) => {
      dispatch(changeFocusedProviderPoi(providerPoi));

      gmapGlobal.setGmapCenter({ lat: Number(providerPoi.info.latitude), lng: Number(providerPoi.info.longitude) });
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusCarRentOffer = useCallback(
    (carRentOffer: Providers.Bb.SearchCarRentOffer) => {
      dispatch(changeFocusedCarRentOffer(carRentOffer));

      gmapGlobal.setGmapCenter({ lat: Number(carRentOffer.latitude), lng: Number(carRentOffer.longitude) });
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusProviderTour = useCallback(
    (tour: Providers.Rezdy.Product) => {
      dispatch(changeFocusedProviderTour(tour));

      gmapGlobal.setGmapCenter({ lat: Number(tour.latitude), lng: Number(tour.longitude) });
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusProviderVideo = useCallback(
    (video: Providers.Videreo.ResponseResult) => {
      dispatch(changeFocusedProviderVideo(video));

      gmapGlobal.setGmapCenter({ lat: Number(video.lat), lng: Number(video.lng) });
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusProviderEvent = useCallback(
    (event: Providers.Victory.Event) => {
      dispatch(changeFocusedProviderEvent(event));

      gmapGlobal.setGmapCenter({ lat: Number(event.venue.address.latitude), lng: Number(event.venue.address.longitude) });
      gmapGlobal.setGmapZoomFocus();
    },
    [dispatch]
  );

  const focusLost = useCallback(() => {
    dispatch(clearFocus());
  }, [dispatch]);

  return { focus, focusLost, focusStep, focusAlternative, focusPoi, focusProviderPoi, focusCarRentOffer, focusProviderTour, focusProviderVideo, focusProviderEvent };
};

export default useFocus;
