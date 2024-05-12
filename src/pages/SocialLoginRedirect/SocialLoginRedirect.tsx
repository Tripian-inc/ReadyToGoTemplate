import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { api } from "@tripian/core";
import { PageLoading } from "@tripian/react";
import { TRIPS, LOGIN, SOCIAL_LOGIN_REDIRECT } from "../../constants/ROUTER_PATH_TITLE";
import Model from "@tripian/model";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import { saveLocalStorageToken } from "../../App/AppWrapper/localStorages";

const SocialLoginRedirect = () => {
  const { loggedIn } = useAuth();
  const { userFetch } = useUser();

  const history = useHistory();

  useEffect(() => {
    const callbackSuccessLogin = (token: Model.Token) => {
      saveLocalStorageToken(token);
      loggedIn();
      userFetch();
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
          console.log("newToken", newToken);

          api.setToken(newToken);
          callbackSuccessLogin(newToken);
          history.replace(TRIPS.PATH);
        })
        .catch(() => {
          history.replace(LOGIN.PATH);
        });
    }
  }, [history, loggedIn, userFetch]);

  return <PageLoading />;
};

export default SocialLoginRedirect;
