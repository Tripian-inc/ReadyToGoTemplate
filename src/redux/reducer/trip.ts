import { Reducer } from "redux";
import IAction from "../model/IAction";
import ITripState, { initialTripState } from "../model/ITripState";
import * as TRIP_ACTIONS from "../actionType/trip";

const tripReducer: Reducer<ITripState, IAction> = (state: ITripState = initialTripState, action: IAction): ITripState => {
  switch (action.type) {
    /**
     *
     * Trip Data
     *
     */
    case TRIP_ACTIONS.CHANGE_REFERENCE: {
      return {
        ...state,
        reference: action.payload.reference,
      };
    }
    case TRIP_ACTIONS.CHANGE_READ_ONLY: {
      return {
        ...state,
        readOnly: action.payload.readOnly,
      };
    }
    case TRIP_ACTIONS.CHANGE_PLANS: {
      return {
        ...state,
        plans: action.payload.plans,
      };
    }
    case TRIP_ACTIONS.CHANGE_PLAN: {
      if (state.plans) {
        const newPlan = action.payload.plan;
        const newState: ITripState = { ...state, plans: [...state.plans] };

        const updatedPlanIndex = state.plans.findIndex((plan) => plan.id === newPlan.id);
        if (updatedPlanIndex > -1 && newState.plans) {
          newState.plans[updatedPlanIndex] = newPlan;
        } else {
          // eslint-disable-next-line no-console
          console.warn("Redux CHANGE_PLAN reducer:", "Updated plan id not found in plans");
        }

        return newState;
      }

      // eslint-disable-next-line no-console
      console.warn("Redux CHANGE_PLAN reducer:", "Updated plan called with undefined plans");
      return state;
    }

    /**
     *
     * Relational Data
     *
     */
    case TRIP_ACTIONS.CHANGE_ALTERNATIVES: {
      return {
        ...state,
        alternatives: action.payload.alternatives,
      };
    }
    case TRIP_ACTIONS.CHANGE_FAVORITES: {
      return {
        ...state,
        favorites: action.payload.favorites,
      };
    }
    case TRIP_ACTIONS.CHANGE_REACTIONS: {
      return {
        ...state,
        reactions: action.payload.reactions,
      };
    }
    case TRIP_ACTIONS.CHANGE_OFFERS: {
      return {
        ...state,
        offers: action.payload.offers,
      };
    }
    case TRIP_ACTIONS.CHANGE_RESERVATIONS: {
      return {
        ...state,
        reservations: action.payload.reservations,
      };
    }

    /**
     *
     * Loadings
     *
     */
    case TRIP_ACTIONS.CHANGE_LOADING_REFERENCE: {
      return { ...state, loading: { ...state.loading, reference: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_PLANS: {
      return { ...state, loading: { ...state.loading, plans: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_ALTERNATIVES: {
      return { ...state, loading: { ...state.loading, alternatives: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_FAVORITES: {
      return { ...state, loading: { ...state.loading, favorites: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_REACTIONS: {
      return { ...state, loading: { ...state.loading, reactions: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_OFFERS: {
      return { ...state, loading: { ...state.loading, offers: action.payload.loading } };
    }
    case TRIP_ACTIONS.CHANGE_LOADING_RESERVATIONS: {
      return { ...state, loading: { ...state.loading, reservations: action.payload.loading } };
    }

    /**
     *
     * Errors
     *
     */
    case TRIP_ACTIONS.SAVE_NOTIFICATION: {
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
    case TRIP_ACTIONS.HIDE_NOTIFICATION: {
      const hideNotificationItem = state.notifications.find((notification) => notification.id === action.payload.id);
      if (hideNotificationItem)
        return { ...state, notifications: [...state.notifications.filter((notification) => notification.id !== action.payload.id), { ...hideNotificationItem, hide: true }] };
      return state;
    }

    /**
     *
     * Clear
     *
     */
    case TRIP_ACTIONS.CLEAR:
      return initialTripState;

    default:
      return state;
  }
};

export default tripReducer;
