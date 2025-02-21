import { Reducer } from "redux";
import IAction from "../model/IAction";
import IUserState, { initialUserState } from "../model/IUserState";
import * as USER_ACTIONS from "../actionType/user";

const userReducer: Reducer<IUserState, IAction> = (state: IUserState = initialUserState, action: IAction): IUserState => {
  switch (action.type) {
    /**
     *
     * Auths
     *
     */
    case USER_ACTIONS.LOGIN_FINALLY:
      return {
        ...state,
        isLoggedIn: true,
      };
    case USER_ACTIONS.LOGOUT_FINALLY:
      return initialUserState;

    /**
     *
     * User Data
     *
     */
    case USER_ACTIONS.CHANGE_USER:
      return { ...state, user: action.payload.user };
    case USER_ACTIONS.CHANGE_TRIP_REFERENCES:
      return { ...state, tripReferences: action.payload.tripReferences };
    case USER_ACTIONS.CHANGE_COMPANIONS:
      return { ...state, companions: action.payload.companions };

    /**
     *
     * Loadings
     *
     */
    case USER_ACTIONS.CHANGE_LOADING_USER: {
      return { ...state, loading: { ...state.loading, user: action.payload.loading } };
    }
    case USER_ACTIONS.CHANGE_LOADING_TRIP_REFERENCES: {
      return { ...state, loading: { ...state.loading, tripReferences: action.payload.loading } };
    }
    case USER_ACTIONS.CHANGE_LOADING_COMPANIONS: {
      return { ...state, loading: { ...state.loading, companions: action.payload.loading } };
    }

    /**
     *
     * Errors
     *
     */
    case USER_ACTIONS.SAVE_NOTIFICATION: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: state.notifications.length + 1,
            type: action.payload.type,
            functionName: action.payload.functionName,
            message: action.payload.message,
            closeMs: action.payload.closeMs,
            hide: action.payload.hide,
          },
        ],
      };
    }
    case USER_ACTIONS.HIDE_NOTIFICATION: {
      const hideNotificationItem = state.notifications.find((notification) => notification.id === action.payload.id);
      if (hideNotificationItem)
        return { ...state, notifications: [...state.notifications.filter((notification) => notification.id !== action.payload.id), { ...hideNotificationItem, hide: true }] };
      return state;
    }

    /**
     *
     * Default
     *
     */
    default:
      return state;
  }
};

export default userReducer;
