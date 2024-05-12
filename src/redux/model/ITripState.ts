import Model from "@tripian/model";
import IFavoritePoi from "../../models/IFavoritePoi";
import IStepAlternatives from "../../models/IStepAlternatives";

interface ITripState {
  // Trip Data
  reference?: Model.TripReference;
  readOnly: boolean;
  plans?: Model.Plan[];

  // Relational Data
  alternatives?: IStepAlternatives[];
  favorites?: IFavoritePoi[];
  reactions?: Model.UserReaction[];
  offers?: Model.Poi[];
  reservations?: Model.UserReservation[];

  // Loadings
  loading: { reference: boolean; plans: boolean; alternatives: boolean; favorites: boolean; reactions: boolean; offers: boolean; reservations: boolean };

  // Notifications
  notifications: { id: number; type: Model.NOTIFICATION_TYPE; functionName: string; title: string; message: string; closeMs: number; hide: boolean }[];
}

export default ITripState;

export const initialTripState: ITripState = {
  // Trip Data
  reference: undefined,
  readOnly: false,
  plans: undefined,

  // Relational Data
  alternatives: undefined,
  favorites: undefined,
  reactions: undefined,
  offers: undefined,
  reservations: undefined,

  // Loadings
  loading: { reference: false, plans: false, alternatives: false, favorites: false, reactions: false, offers: false, reservations: false },

  // Notifications
  notifications: [],
};
