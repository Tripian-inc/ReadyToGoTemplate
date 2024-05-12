

import { Reducer } from 'redux';
import IAction from '../model/IAction';
import ILayoutState from '../model/ILayoutState';
import * as ACTION_TYPES from '../actionType/layout';

const initialState: ILayoutState = {
  initLoading: true,
  // navbarVisible: false,
  tripListVisible: true,
  // focusInfoVisible: false,
  // searchVisible: false,
  // favoritesVisible: false,
  // favoritesModalVisible: false,
  // bookingsModalVisible: false,
  // localExperiencesModalVisible: false,
};

const layoutReducer: Reducer<ILayoutState, IAction> = (state: ILayoutState = initialState, action: IAction): ILayoutState => {
  switch (action.type) {
    case ACTION_TYPES.CHANGE_INIT_LOADING:
      return {
        ...state,
        initLoading: action.payload.loading,
      };
    // case ACTION_TYPES.CHANGE_NAVBAR_VISIBLE:
    //   return {
    //     ...state,
    //     navbarVisible: action.payload.visible,
    //   };
    case ACTION_TYPES.CHANGE_TRIP_LIST_VISIBLE:
      return {
        ...state,
        tripListVisible: action.payload.visible,
      };
    // case ACTION_TYPES.CHANGE_FOCUS_INFO_VISIBLE:
    //   return {
    //     ...state,
    //     focusInfoVisible: action.payload.visible,
    //   };
    // case ACTION_TYPES.CHANGE_SEARCH_VISIBLE: {
    //   const favoritesVisible = action.payload.visible ? false : state.favoritesVisible;
    //   return {
    //     ...state,
    //     searchVisible: action.payload.visible,
    //     favoritesVisible,
    //     // focusInfoVisible: false,
    //   };
    // }
    // case ACTION_TYPES.CHANGE_FAVORITES_VISIBLE: {
    //   const searchVisible = action.payload.visible ? false : state.searchVisible;
    //   return {
    //     ...state,
    //     favoritesVisible: action.payload.visible,
    //     searchVisible,
    //     // focusInfoVisible: false,
    //   };
    // }
    // case ACTION_TYPES.CHANGE_FAVORITES_MODAL_VISIBLE:
    //   return {
    //     ...state,
    //     favoritesModalVisible: action.payload.visible,
    //   };
    // case ACTION_TYPES.CHANGE_BOOKINGS_MODAL_VISIBLE:
    //   return {
    //     ...state,
    //     bookingsModalVisible: action.payload.visible,
    //   };
    // case ACTION_TYPES.CHANGE_LOCAL_EXPERIENCES_MODAL_VISIBLE:
    //   return {
    //     ...state,
    //     localExperiencesModalVisible: action.payload.visible,
    //   };
    default:
      return state;
  }
};

export default layoutReducer;
