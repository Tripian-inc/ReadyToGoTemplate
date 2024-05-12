/*
 * action types
 */

/* We don't use to mutate this states. Google maps component callbacks call these actions */
export const CHANGED_ZOOM_STATE = 'CHANGED_ZOOM_STATE';
export const CHANGED_CENTER_STATE = 'CHANGED_CENTER_STATE';
export const CHANGED_BOUNDRY_STATE = 'CHANGED_BOUNDRY_STATE';

/* We use to set this actions manually */
export const SET_ZOOM = 'SET_ZOOM';
export const SET_CENTER = 'SET_BOUNDRY';
export const SET_BOUNDRY = 'SET_BOUNDRY';

export const HANDLE_MAP_CLICK = 'HANDLE_MAP_CLICK';
export const HANDLE_MARKER_CLICK_STEP = 'HANDLE_MARKER_CLICK_STEP';
export const CHANGE_LEGS = 'CHANGE_LEGS';
