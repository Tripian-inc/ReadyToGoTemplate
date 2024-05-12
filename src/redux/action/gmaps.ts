import Model from '@tripian/model';
import { RouteResult } from '@tripian/react';
import IAction from '../model/IAction';
import * as GMAPS_ACTIONS from '../actionType/gmap';

/* We don't use to mutate this states. Google maps component callbacks call these actions */
export const changedCenter = (latlng?: google.maps.LatLng): IAction => ({
  type: GMAPS_ACTIONS.CHANGED_CENTER_STATE,
  payload: { latlng },
});

export const setCenter = (latlng: Model.Coordinate): IAction => ({
  type: GMAPS_ACTIONS.SET_CENTER,
  payload: { latlng },
});

export const changedZoom = (zoom?: number): IAction => ({
  type: GMAPS_ACTIONS.CHANGED_ZOOM_STATE,
  payload: { zoom },
});

/* We use to set this actions manually */
export const setZoom = (zoom: number): IAction => ({
  type: GMAPS_ACTIONS.SET_ZOOM,
  payload: { zoom },
});

export const changedBoundry = (boundry?: google.maps.LatLngBounds | null): IAction => ({
  type: GMAPS_ACTIONS.CHANGED_BOUNDRY_STATE,
  payload: { boundry },
});

export const setBoundry = (boundry: Array<number>): IAction => ({
  type: GMAPS_ACTIONS.SET_BOUNDRY,
  payload: { boundry },
});

export const changeLegs = (legs?: RouteResult.ILeg[]): IAction => ({
  type: GMAPS_ACTIONS.CHANGE_LEGS,
  payload: { legs },
});

export const handleMapClick = (coordinate: Model.Coordinate): IAction => ({
  type: GMAPS_ACTIONS.HANDLE_MAP_CLICK,
  payload: { coordinate },
});

export const handleClickMarkerStep = (step: Model.Step): IAction => ({
  type: GMAPS_ACTIONS.HANDLE_MARKER_CLICK_STEP,
  payload: { step },
});
