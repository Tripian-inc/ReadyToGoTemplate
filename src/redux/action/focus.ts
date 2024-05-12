import Model, { Providers } from "@tripian/model";
import IAction from "../model/IAction";
import * as FOCUS_ACTIONS from "../actionType/focus";

export const changeFocusedStep = (step: Model.Step): IAction => ({
  type: FOCUS_ACTIONS.CHANGE_FOCUSED_STEP,
  payload: { step },
});

export const changeFocusedAlternative = (stepId: number, poi: Model.Poi): IAction => ({
  type: FOCUS_ACTIONS.CHANGE_FOCUSED_ALTERNATIVE,
  payload: { stepId, poi },
});

export const changeFocusedPoi = (poi: Model.Poi): IAction => ({
  type: FOCUS_ACTIONS.CHANGE_FOCUSED_POI,
  payload: { poi },
});

export const changeFocusedProviderPoi = (providerPoi: Providers.Bb.SearchAccommodationHotelOffer): IAction => ({
  type: FOCUS_ACTIONS.CHANGE_FOCUSED_PROVIDER_POI,
  payload: { providerPoi },
});

export const changeFocusedCarRentOffer = (carRentOffer: Providers.Bb.SearchCarRentOffer): IAction => ({
  type: FOCUS_ACTIONS.CHANGE_FOCUSED_CAR_RENT_OFFER,
  payload: { carRentOffer },
});

export const clearFocus = (): IAction => ({
  type: FOCUS_ACTIONS.CLEAR_FOCUS,
  payload: undefined,
});
