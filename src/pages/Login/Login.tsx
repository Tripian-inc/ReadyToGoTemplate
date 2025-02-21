import React, { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { FormTemplateLogin } from "@tripian/react";

import { DELETE_USER, LOGIN, TRIPS, TRIP_CLONE, USE_TRIP_URL } from "../../constants/ROUTER_PATH_TITLE";
import { saveLocalStorageToken } from "../../App/AppWrapper/localStorages";

import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import useTranslate from "../../hooks/useTranslate";

import tripianImg from "../../assets/img/tripian-logo-50.png";
import tripianNew from "../../assets/img/tripian-new-icon.png";
import classes from "./Login.module.scss";

const LoginPage = () => {
  const { isLoggedIn, loggedIn } = useAuth();
  const { user, userFetch } = useUser();
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

  document.title = LOGIN.TITLE(t("user.login"));

  useEffect(() => {
    // Already logged in. Redirect to where came from or home
    if (isLoggedIn && user) {
      //TODO private route logout clear history
      // const from: any = location.state || { from: { pathname: TRIPS.PATH } };

      if (sharedTripHash) {
        history.replace(`${TRIP_CLONE.PATH}/${sharedTripHash}`);
      } else if (location.state && (location.state as { from: string | undefined })?.from === DELETE_USER.PATH) {
        history.replace(DELETE_USER.PATH);
      } else {
        // history.replace(from.from);
        history.replace(TRIPS.PATH);
      }

      // HIDE LOGIN for butter redirect to hash login
    } else if (!window.tconfig.SHOW_LOGIN) history.replace(USE_TRIP_URL.PATH);
    else {
      // Do nothing
    }
  }, [isLoggedIn, history, location, user, sharedTripHash]);

  const callbackSuccessLogin = (token: Model.Token) => {
    saveLocalStorageToken(token);
    loggedIn();
    userFetch();
  };

  if (isLoggedIn) return null;

  return (
    <div className={classes.loginPage}>
      <div className={classes.loginAppLogoContent}>
        <img
          className={classes.loginAppLogo}
          src={theme === "dark" ? window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK : window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT || tripianNew}
          alt={window.tconfig.BRAND_NAME}
        />
      </div>
      <div className="full-center-x">
        {/* <div className="login-form-wrapper login-content"> */}
        <FormTemplateLogin
          login={api.loginEmail}
          successLogin={callbackSuccessLogin}
          reCaptchaSiteKey="6LcSweAUAAAAAJKsnLlDnnUTLFG6cspHMI1BJCfP"
          showCaptcha={process.env.NODE_ENV === "production"}
          showRegister={window.tconfig.SHOW_REGISTER}
          socialLoginConfigs={{
            clientId: window.tconfig.COGNITO.CLIENT_ID,
            domain: window.tconfig.COGNITO.DOMAIN,
            identityProviders: window.tconfig.COGNITO.IDENTITY_PROVIDERS,
            region: window.tconfig.COGNITO.REGION,
            baseDomain: `${window.tconfig.DOMAIN_ORIGIN}${window.tconfig.DOMAIN_ROUTER_BASE_NAME}`,
          }}
          forgotPassword={() => history.push("/forgot-password")}
          signUpButtonCallBack={() => {
            if (sharedTripHash) {
              history.push(`/register?sharedTripHash=${sharedTripHash}`);
            } else {
              history.push("/register");
            }
          }}
          customQuery={sharedTripHash}
          t={t}
        />
        {/* </div> */}
        <a className={classes.loginPoweredBy} target="_blank" rel="noreferrer" href="https://www.tripian.com/">
          <span>Powered by</span>
          <img src={tripianImg} alt="" />
        </a>
      </div>

      {window.tconfig.IMAGE_PATHS.FORM_BG_IMG_URL && (
        <img className={`${classes.loginAppBackground} hide-s`} src={window.tconfig.IMAGE_PATHS.FORM_BG_IMG_URL} alt={window.tconfig.BRAND_NAME} />
      )}
    </div>
  );
};

export default LoginPage;
