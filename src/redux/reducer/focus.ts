import { Reducer } from "redux";
import IAction from "../model/IAction";
import IFocusState, { initialFocusState } from "../model/IFocusState";
import * as ACTION_TYPES from "../actionType/focus";

const focusReducer: Reducer<IFocusState, IAction> = (state: IFocusState = initialFocusState, action: IAction): IFocusState => {
  switch (action.type) {
    case ACTION_TYPES.CHANGE_FOCUSED_STEP:
      return {
        ...initialFocusState,
        step: action.payload.step,
      };
    case ACTION_TYPES.CHANGE_FOCUSED_ALTERNATIVE:
      return {
        ...initialFocusState,
        alternative: { stepId: action.payload.stepId, poi: action.payload.poi },
      };
    case ACTION_TYPES.CHANGE_FOCUSED_POI:
      return {
        ...initialFocusState,
        poi: action.payload.poi,
      };
    case ACTION_TYPES.CHANGE_FOCUSED_PROVIDER_POI:
      return {
        ...initialFocusState,
        providerPoi: action.payload.providerPoi,
      };
    case ACTION_TYPES.CHANGE_FOCUSED_CAR_RENT_OFFER:
      return {
        ...initialFocusState,
        carRentOffer: action.payload.carRentOffer,
      };
    case ACTION_TYPES.CLEAR_FOCUS:
      return initialFocusState;

    default:
      return state;
  }
};

export default focusReducer;
