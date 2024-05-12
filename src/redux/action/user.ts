import Model from "@tripian/model";
// import { api } from '@tripian/core';
import * as USER_ACTIONS from "../actionType/user";
import IAction from "../model/IAction";

// import { IThunkResult, IThunkDispatch } from '../actionType/thunk';

/**
 *
 * Auths
 *
 */
export const loginFinally = (): IAction => ({
  type: USER_ACTIONS.LOGIN_FINALLY,
  payload: null,
});

export const logoutFinally = (): IAction => ({
  type: USER_ACTIONS.LOGOUT_FINALLY,
  payload: null,
});

/**
 *
 * User Data
 *
 */
export const changeUser = (user: Model.User): IAction => ({
  type: USER_ACTIONS.CHANGE_USER,
  payload: { user },
});

export const changeTripReferences = (tripReferences: Model.TripReference[]): IAction => ({
  type: USER_ACTIONS.CHANGE_TRIP_REFERENCES,
  payload: { tripReferences },
});

export const changeCompanions = (companions: Model.Companion[]): IAction => ({
  type: USER_ACTIONS.CHANGE_COMPANIONS,
  payload: { companions },
});

/**
 *
 * Loadings
 *
 */
export const changeLoadingUser = (loading: boolean): IAction => ({
  type: USER_ACTIONS.CHANGE_LOADING_USER,
  payload: { loading },
});

export const changeLoadingTripReferences = (loading: boolean): IAction => ({
  type: USER_ACTIONS.CHANGE_LOADING_TRIP_REFERENCES,
  payload: { loading },
});

export const changeLoadingCompanions = (loading: boolean): IAction => ({
  type: USER_ACTIONS.CHANGE_LOADING_COMPANIONS,
  payload: { loading },
});

/**
 *
 * Notifications
 *
 */
export const saveNotification = (type: Model.NOTIFICATION_TYPE, functionName: string, title: string, message: string, closeMs: number = 3500, hide = false): IAction => ({
  type: USER_ACTIONS.SAVE_NOTIFICATION,
  payload: { type, functionName, title, message, closeMs, hide },
});

export const hideNotification = (id: number): IAction => ({
  type: USER_ACTIONS.HIDE_NOTIFICATION,
  payload: { id },
});

/**
 *
 *
 *
 * THUNK ACTIONS
 *
 *
 */

/**
 *
 * Auths
 *
 */
// export const logout = (): IThunkResult<void> => {
//   return (dispatch: IThunkDispatch) => {
//     api.logout();
//     dispatch(logoutFinally());
//   };
// };

/**
 *
 * User Data
 *
 */
// export const fetchUser = (): IThunkResult<Promise<Model.User>> => {
//   return async (dispatch: IThunkDispatch) => {
//     dispatch(changeLoadingUser(true));

//     return api
//       .user()
//       .then((user) => {
//         dispatch(changeUser(user));
//         return user;
//       })
//       .catch((userError) => {
//         dispatch(saveError('fetchUser', 'Fetch User', userError));
//         return userError;
//       })
//       .finally(() => {
//         dispatch(changeLoadingUser(false));
//       });
//   };
// };

// export const fetchTripReferences = (): IThunkResult<Promise<Model.TripReference[]>> => {
//   return async (dispatch: IThunkDispatch) => {
//     dispatch(changeLoadingTripReferences(true));

//     return api
//       .tripRefs()
//       .then((tripReferences: Model.TripReference[]) => {
//         dispatch(changeTripReferences(tripReferences));
//         return tripReferences;
//       })
//       .catch((fetchTripReferencesError) => {
//         dispatch(saveError('fetchTripReferences', 'Fetch User Trips', fetchTripReferencesError));
//         return fetchTripReferencesError;
//       })
//       .finally(() => {
//         dispatch(changeLoadingTripReferences(false));
//       });
//   };
// };

// export const fetchCompanions = (force: boolean = false): IThunkResult<Promise<Model.Companion[]>> => {
//   return async (dispatch: IThunkDispatch) => {
//     dispatch(changeLoadingCompanions(true));

//     return api
//       .companions(force)
//       .then((companions) => {
//         dispatch(changeCompanions(companions));
//         return companions;
//       })
//       .catch((companionsError) => {
//         dispatch(saveError('fetchCompanions', 'Fetch User Companions', companionsError));
//         return companionsError;
//       })
//       .finally(() => {
//         dispatch(changeLoadingCompanions(false));
//       });
//   };
// };

// export const companionAdd = (userCompanionRequest: Model.CompanionRequest): IThunkResult<Promise<Model.Companion[]>> => {
//   return async (dispatch: IThunkDispatch) => {
//     return api.combo
//       .companionAdd(userCompanionRequest)
//       .then((companions) => {
//         dispatch(changeCompanions(companions));
//         return companions;
//       })
//       .catch((addCompanionError) => {
//         dispatch(saveError('companionAdd', 'Add Companion', addCompanionError));
//         return addCompanionError;
//       });
//   };
// };

// export const companionUpdate = (companion: Model.Companion): IThunkResult<Promise<Model.Companion>> => {
//   return async (dispatch: IThunkDispatch) => {
//     return api.combo
//       .companionUpdate(companion)
//       .then((companions) => {
//         dispatch(changeCompanions(companions));
//         return companions;
//       })
//       .catch((updateCompanionError) => {
//         dispatch(saveError('companionUpdate', 'Update Companion', updateCompanionError));
//         return updateCompanionError;
//       });
//   };
// };

// export const companionDelete = (companionId: number): IThunkResult<Promise<any>> => {
//   return async (dispatch: IThunkDispatch) => {
//     return api.combo
//       .companionDelete(companionId)
//       .then((companions) => {
//         dispatch(changeCompanions(companions));
//         return companions;
//       })
//       .catch((deleteCompanionError) => {
//         dispatch(saveError('companionDelete', 'Delete Companion', deleteCompanionError));
//         return deleteCompanionError;
//       });
//   };
// };
