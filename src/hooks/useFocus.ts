import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import Model, { Providers } from "@tripian/model";

import IFocusState from "../redux/model/IFocusState";
import ICombinedState from "../redux/model/ICombinedState";
import { changeFocusedStep, changeFocusedAlternative, changeFocusedPoi, clearFocus, changeFocusedProviderPoi, changeFocusedCarRentOffer } from "../redux/action/focus";
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

  const focusLost = useCallback(() => {
    dispatch(clearFocus());
  }, [dispatch]);

  return { focus, focusLost, focusStep, focusAlternative, focusPoi, focusProviderPoi, focusCarRentOffer };
};

export default useFocus;
