import Model, { Providers } from "@tripian/model";

interface IFocusState {
  step?: Model.Step;
  alternative?: { poi: Model.Poi; stepId: number };
  poi?: Model.Poi;
  providerPoi?: Providers.Bb.SearchAccommodationHotelOffer; // || Providers.Airbnb.SearchAccommodationHotelOffer
  carRentOffer?: Providers.Bb.SearchCarRentOffer;
}

export default IFocusState;

export const initialFocusState: IFocusState = {};
