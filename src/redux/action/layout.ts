import IAction from '../model/IAction';
import * as LAYOUT_ACTIONS from '../actionType/layout';

export const changeInitLoading = (loading: boolean): IAction => ({
  type: LAYOUT_ACTIONS.CHANGE_INIT_LOADING,
  payload: { loading },
});

// export const changeNavbarVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_NAVBAR_VISIBLE,
//   payload: { visible },
// });

export const changeTripListVisible = (visible: boolean): IAction => ({
  type: LAYOUT_ACTIONS.CHANGE_TRIP_LIST_VISIBLE,
  payload: { visible },
});

// export const changeFocusInfoVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_FOCUS_INFO_VISIBLE,
//   payload: { visible },
// });

// export const changeSearchVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_SEARCH_VISIBLE,
//   payload: { visible },
// });

// export const changeFavoritesVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_FAVORITES_VISIBLE,
//   payload: { visible },
// });

// export const changeFavoritesModalVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_FAVORITES_MODAL_VISIBLE,
//   payload: { visible },
// });

// export const changeBookingsModalVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_BOOKINGS_MODAL_VISIBLE,
//   payload: { visible },
// });

// export const changeLocalExperiencesModalVisible = (visible: boolean): IAction => ({
//   type: LAYOUT_ACTIONS.CHANGE_LOCAL_EXPERIENCES_MODAL_VISIBLE,
//   payload: { visible },
// });
