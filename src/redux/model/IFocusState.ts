import Model, { Providers } from "@tripian/model";

interface IFocusState {
  step?: Model.Step;
  alternative?: { poi: Model.Poi; stepId: number };
  poi?: Model.Poi;
  providerPoi?: Providers.Bb.SearchAccommodationHotelOffer; // || Providers.Airbnb.SearchAccommodationHotelOffer
  carRentOffer?: Providers.Bb.SearchCarRentOffer;
  providerTour?: Providers.Rezdy.Product;
  providerVideo?: Providers.Videreo.ResponseResult;
  providerEvent?: Providers.Victory.Event;
}

export default IFocusState;

export const initialFocusState: IFocusState = {};
