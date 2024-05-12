import Model from "@tripian/model";

interface IUserState {
  // Auths
  isLoggedIn: boolean;

  // User Data
  user?: Model.User;
  tripReferences?: Model.TripReference[];
  companions?: Model.Companion[];

  // Loadings
  loading: { user: boolean; tripReferences: boolean; companions: boolean };

  // Notifications
  notifications: { id: number; type: Model.NOTIFICATION_TYPE; functionName: string; title: string; message: string; closeMs: number; hide: boolean }[];
}

export default IUserState;

export const initialUserState: IUserState = {
  // Auths
  isLoggedIn: false,

  // User Data
  user: undefined,
  tripReferences: undefined,
  companions: undefined,

  // Loadings
  loading: { user: false, tripReferences: false, companions: true },

  // Notifications
  notifications: [],
};
