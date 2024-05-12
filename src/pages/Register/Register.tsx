import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import Model from "@tripian/model";
import { FormTemplateRegister } from "@tripian/react";

import * as gtag from "../../gtag";
import { REGISTER, LOGIN, USE_TRIP_URL, NOT_FOUND, TRIPS, TRIP_CLONE } from "../../constants/ROUTER_PATH_TITLE";
import { saveLocalStorageToken } from "../../App/AppWrapper/localStorages";

import useUser from "../../hooks/useUser";
import useAuth from "../../hooks/useAuth";
import useTranslate from "../../hooks/useTranslate";
import { useLocalStorage } from "../../hooks/useLocalStorage";

import tripianImg from "../../assets/img/tripian-logo-50.png";
import tripianNew from "../../assets/img/tripian-new-icon.png";
import classes from "./Register.module.scss";

const RegisterPage = () => {
  const { isLoggedIn, loggedIn, registerEmail } = useAuth();
  const { userFetch } = useUser();
  const { t } = useTranslate();

  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };
  const { sharedTripHash } = useQuery<{ sharedTripHash: string | undefined }>();

  const { getLocalData } = useLocalStorage<"light" | "dark">("theme");
  const theme = getLocalData();

  const history = useHistory();
  const location = useLocation();

  document.title = REGISTER.TITLE(t("user.register"));

  useEffect(() => {
    // Already logged in. Redirect to where came from or home
    if (isLoggedIn) {
      const from: any = location.state || { from: { pathname: TRIPS.PATH } };

      if (sharedTripHash) {
        history.replace(`${TRIP_CLONE.PATH}/${sharedTripHash}`);
      } else {
        history.replace(from.from);
      }

      // HIDE LOGIN for butter redirect to hash login
    } else if (!window.tconfig.SHOW_LOGIN) {
      history.replace(USE_TRIP_URL.PATH);

      // Register disabled, redirect to not found
    } else if (!window.tconfig.SHOW_REGISTER) history.replace(NOT_FOUND.PATH);
    else {
      // Do nothing
    }
  }, [isLoggedIn, history, location, sharedTripHash]);

  const callbackSuccessRegister = (userEmail: string, token: Model.Token) => {
    gtag.googleAnalyticsEvent("Created new user", { user: userEmail });
    saveLocalStorageToken(token);
    loggedIn();
    userFetch();
  };

  return (
    <div className={classes.registerPage}>
      <div className={classes.registerAppLogoContent}>
        <img
          className={classes.registerAppLogo}
          src={theme === "dark" ? window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK : window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT || tripianNew}
          alt={window.tconfig.BRAND_NAME}
        />
      </div>
      <div className="full-center-x-large pb12">
        <FormTemplateRegister
          register={registerEmail}
          successRegister={callbackSuccessRegister}
          reCaptchaSiteKey="6LcSweAUAAAAAJKsnLlDnnUTLFG6cspHMI1BJCfP"
          showCaptcha={process.env.NODE_ENV === "production"}
          goBackLogin={() => history.push(LOGIN.PATH)}
          t={t}
        />

        <a className={classes.registerPoweredBy} target="_blank" rel="noreferrer" href="https://www.tripian.com/">
          <span>Powered by</span>
          <img src={tripianImg} alt="" />
        </a>
      </div>

      {window.tconfig.IMAGE_PATHS.FORM_BG_IMG_URL && (
        <img className="login-app-background hide-s" src={window.tconfig.IMAGE_PATHS.FORM_BG_IMG_URL} alt={window.tconfig.BRAND_NAME} />
      )}
    </div>
  );
};

export default RegisterPage;
