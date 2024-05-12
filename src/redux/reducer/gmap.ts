import { Reducer } from "redux";
import IAction from "../model/IAction";
import IGmapState from "../model/IGmapState";
import * as ACTION_TYPES from "../actionType/gmap";
import gmapGlobal from "../gmapGlobal";

const initialState: IGmapState = {
  // centerState: { lat: 52.371888305746985, lng: 4.896546591529578 }, // Amsterdam
  centerState: { lat: 0, lng: 0 }, // Bogota
  zoomState: 13,
  boundryState: [],
  legs: [],
};

const gmapReducer: Reducer<IGmapState, IAction> = (state: IGmapState = initialState, action: IAction): IGmapState => {
  switch (action.type) {
    /* We don't use to mutate this states. Google maps component callbacks call these actions */
    case ACTION_TYPES.CHANGED_CENTER_STATE:
      return {
        ...state,
        centerState: action.payload.latlng,
      };
    case ACTION_TYPES.CHANGED_ZOOM_STATE:
      return {
        ...state,
        zoomState: action.payload.zoom,
      };
    case ACTION_TYPES.CHANGED_BOUNDRY_STATE:
      return {
        ...state,
        boundryState: action.payload.boundry,
      };

    /* We use to set this actions manually */
    case ACTION_TYPES.SET_CENTER:
      gmapGlobal.setGmapCenter(action.payload.latlng);
      return state;
    case ACTION_TYPES.SET_ZOOM:
      gmapGlobal.setGmapZoom(action.payload.zoom);
      return state;
    case ACTION_TYPES.SET_BOUNDRY:
      gmapGlobal.setGmapBounds(action.payload.boundry);
      return state;

    case ACTION_TYPES.HANDLE_MAP_CLICK:
      return {
        ...state,
      };
    case ACTION_TYPES.HANDLE_MARKER_CLICK_STEP:
      return {
        ...state,
        // center: action.payload.step.poi.coordinate,
      };

    case ACTION_TYPES.CHANGE_LEGS:
      return {
        ...state,
        legs: action.payload.legs,
      };

    default:
      return state;
  }
};

export default gmapReducer;
