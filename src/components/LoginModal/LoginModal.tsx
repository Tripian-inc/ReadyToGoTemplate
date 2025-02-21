/* eslint-disable react/require-default-props */

import React, { useEffect } from "react";
import styles from "./LoginModal.module.scss";
import { CloseIconButton2, SocialLogin } from "@tripian/react";
import { useHistory } from "react-router";
import useAuth from "../../hooks/useAuth";
import { TRIPS, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";
import useUser from "../../hooks/useUser";

type Prop = {
  sharedTripHash: string;
  onCancel: () => void;
};
export const LoginModal = ({ sharedTripHash, onCancel }: Prop) => {
  const { isLoggedIn } = useAuth();
  const { user } = useUser();

  const history = useHistory();

  const { t } = useTranslate();

  useEffect(() => {
    // Already logged in. Redirect to where came from or home
    if (isLoggedIn && user) {
      if (sharedTripHash) {
        history.replace(`${TRIP_PLAN.PATH}/${sharedTripHash}!s`);
      } else {
        history.replace(TRIPS.PATH);
      }
    } else {
      // Do nothing
    }
  }, [isLoggedIn, history, user, sharedTripHash]);

  const socialLoginConfigs = {
    clientId: window.tconfig.COGNITO.CLIENT_ID,
    domain: window.tconfig.COGNITO.DOMAIN,
    identityProviders: window.tconfig.COGNITO.IDENTITY_PROVIDERS,
    region: window.tconfig.COGNITO.REGION,
    baseDomain: `${window.tconfig.DOMAIN_ORIGIN}${window.tconfig.DOMAIN_ROUTER_BASE_NAME}`,
  };

  return (
    <div id="loginModal" className={styles.loginModal}>
      <div className={styles.dialog}>
        <div className="relative w-full top-[-1.75rem] right-[-0.5rem]">
          <CloseIconButton2 fill="#2B2B33" clicked={onCancel} rounded />
        </div>
        <div className="flex h-full flex-col justify-center items-center">
          <div className="flex flex-row">
            <h1 className="font-bold text-center text-lg">You must log in to view</h1>
          </div>

          {(socialLoginConfigs.identityProviders.includes("Google") || socialLoginConfigs.identityProviders.includes("SignInWithApple")) && (
            <>
              <div className="center px2 mt4 mb6 pt-12 w-full">
                <SocialLogin configs={socialLoginConfigs} customQuery={sharedTripHash} t={t} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
