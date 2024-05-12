import { combineReducers } from 'redux';
// import ICombinedState from '../model/ICombinedState';
import ICombinedState from '../model/ICombinedState';
import IAction from '../model/IAction';

import user from './user';
import trip from './trip';
import focus from './focus';

import gmap from './gmap';
import layout from './layout';

const rootReducer = combineReducers<ICombinedState, IAction>({ user, trip, focus, gmap, layout });

export default rootReducer;
