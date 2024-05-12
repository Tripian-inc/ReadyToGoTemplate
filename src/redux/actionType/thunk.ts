import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import ICombinedState from '../model/ICombinedState';
import IAction from '../model/IAction';

export type IThunkResult<R> = ThunkAction<R, ICombinedState, null, IAction>;
export type IThunkDispatch = ThunkDispatch<ICombinedState, null, IAction>;
