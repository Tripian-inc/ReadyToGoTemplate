import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { api } from "@tripian/core";
import { PageLoading } from "@tripian/react";
import { TRIPS, LOGIN, SOCIAL_LOGIN_REDIRECT, TRIP_CLONE, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import Model from "@tripian/model";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import { saveLocalStorageToken } from "../../App/AppWrapper/localStorages";

const SocialLoginRedirect = () => {
  const { loggedIn } = useAuth();
  const { userFetch } = useUser();

  const history = useHistory();

  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };

  const { state } = useQuery<{ state: string | undefined }>();

  useEffect(() => {
    const callbackSuccessLogin = (token: Model.Token) => {
      saveLocalStorageToken(token);
      loggedIn();
      userFetch();
      window.tconfig.SOCIAL_LOGIN = true;
    };

    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get("code");
    if (queryCode === null) history.replace(LOGIN.PATH);
    else {
      api
        .loginCognito(queryCode, `${window.tconfig.DOMAIN_ORIGIN}${window.tconfig.DOMAIN_ROUTER_BASE_NAME}${SOCIAL_LOGIN_REDIRECT.PATH}`, {
          deviceId: "1234",
          serviceToken: "1234",
          deviceOs: "MACOS",
          osVersion: "13",
          bundleId: "asd",
        })
        .then(async (newToken: Model.Token) => {
          api.setToken(newToken);
          callbackSuccessLogin(newToken);
          // console.log("state", state);
          if (state !== undefined && state !== null && state !== "") {
            if (window.tconfig.WIDGET_THEME_1) {
              history.replace(`${TRIP_PLAN.PATH}/${state}!s/0`);
            } else {
              history.replace(`${TRIP_CLONE.PATH}/${state}`);
            }
          } else {
            history.replace(TRIPS.PATH);
          }
        })
        .catch(() => {
          history.replace(LOGIN.PATH);
        });
    }
  }, [history, loggedIn, userFetch, state]);

  return <PageLoading />;
};

export default SocialLoginRedirect;
