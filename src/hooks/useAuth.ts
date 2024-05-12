import { useDispatch, useSelector } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { useCallback } from "react";
import ICombinedState from "../redux/model/ICombinedState";
import { loginFinally, logoutFinally } from "../redux/action/user";
import { clear } from "../redux/action/trip";

const useAuth = () => {
  const { isLoggedIn, loadingIsLoggedIn } = useSelector((state: ICombinedState) => ({ isLoggedIn: state.user.isLoggedIn, loadingIsLoggedIn: state.user.loading.user }));
  const dispatch = useDispatch();

  const registerEmail = useCallback(
    (registerRequest: Model.RegisterRequest): Promise<Model.Token> =>
      api.register({ email: registerRequest.email, password: registerRequest.password, firstName: registerRequest.firstName, lastName: registerRequest.lastName }),
    []
  );

  const loggedIn = useCallback((): void => {
    dispatch(loginFinally());
  }, [dispatch]);

  const logout = useCallback((): void => {
    api.logout();
    dispatch(logoutFinally());
    dispatch(clear());
  }, [dispatch]);

  return { isLoggedIn, loadingIsLoggedIn, registerEmail, loggedIn, logout };
};

export default useAuth;
