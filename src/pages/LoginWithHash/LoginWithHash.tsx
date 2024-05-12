import React, { useEffect, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Model from "@tripian/model";
import { api } from "@tripian/core";

import { LOGIN_WITH_HASH, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import InitLoading from "../../components/InitLoading/InitLoading";
import { saveNotification } from "../../redux/action/trip";
import { saveLocalStorageToken } from "../../App/AppWrapper/localStorages";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import useTranslate from "../../hooks/useTranslate";

const LoginWithHashPage = () => {
  const { isLoggedIn, loggedIn } = useAuth();
  const { userFetch } = useUser();

  const { t } = useTranslate();

  const { hashParam } = useParams<{ hashParam: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const { hash, hashLogin } = useMemo(() => {
    const params = hashParam.split("!");
    const hash = params[0];
    const hashLogin = params.length > 1 && hashParam.split("!")[1] === "l";
    const shared = params.length > 1 && hashParam.split("!")[1] === "s";
    return { hash, hashLogin, shared };
  }, [hashParam]);

  document.title = LOGIN_WITH_HASH.TITLE(t("auth.loginWithHash"));

  useEffect(() => {
    const redirectToTripPlan = () => {
      history.replace(`${TRIP_PLAN.PATH}/${hashParam}`);
    };

    const loginHashPromise = (tripHash: string): void => {
      api
        .lightLoginHash(tripHash)

        .then((token: Model.Token) => {
          saveLocalStorageToken(token);
          loggedIn();
          userFetch();
        })
        .catch((loginError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "login", "Hash Login", loginError));
        });
    };

    if (isLoggedIn) {
      redirectToTripPlan();
    } else if (hashLogin && window.tconfig.LOGIN_WITH_HASH) {
      loginHashPromise(hash);
    }
  }, [dispatch, hash, hashLogin, hashParam, history, isLoggedIn, loggedIn, userFetch]);

  return (
    <>
      <InitLoading message={t("auth.loginWithHash.message")} />
    </>
  );
};

export default LoginWithHashPage;
