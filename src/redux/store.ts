import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk, { ThunkMiddleware } from "redux-thunk";

import rootReducer from "./reducer";
import ICombinedState from "./model/ICombinedState";
import IAction from "./model/IAction";

const createAppStore = () => {
  let storeEnhancer = applyMiddleware(thunk as ThunkMiddleware<ICombinedState, IAction>);
  if (process.env.NODE_ENV !== "production") storeEnhancer = composeWithDevTools(storeEnhancer);

  const store = createStore(rootReducer, storeEnhancer);
  return store;
};

export default createAppStore;
