/* eslint-disable react/require-default-props */

import React from "react";
import styles from "./CloneModal.module.scss";
import { Button } from "@tripian/react";
import { useHistory } from "react-router";
import useAuth from "../../hooks/useAuth";
import { LOGIN, TRIP_CLONE } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";

type Prop = {
  sharedTripHash: string;
  onCancel: () => void;
};
export const CloneModal = ({ sharedTripHash, onCancel }: Prop) => {
  const { isLoggedIn } = useAuth();
  const history = useHistory();

  const { t } = useTranslate();

  const onClone = () => {
    if (isLoggedIn) {
      history.replace(`${TRIP_CLONE.PATH}/${sharedTripHash}`);
    } else {
      history.push(`${LOGIN.PATH}?sharedTripHash=${sharedTripHash}`);
    }
  };

  return (
    <div id="hebele" className={styles.cloneModal}>
      <div className={styles.dialog}>
        {window.tconfig.LOGIN_WITH_HASH ? (
          <div className="flex h-full flex-col justify-center items-center">
            <div className="flex flex-row">
              <h1 className="font-bold text-center text-lg">{t("trips.cloneTrip.loginWithHashTitle")}</h1>
            </div>

            <div className="flex flex-row w-full justify-evenly items-center pt-12">
              <Button className={styles.cancelButton} color="secondary" text={t("trips.cloneTrip.back")} onClick={onCancel} />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center items-center">
            <div className="flex flex-row">
              <h1 className="font-bold text-center text-lg">{t("trips.cloneTrip.title")}</h1>
            </div>
            <div className="flex flex-1 pt-12 pb-8">
              <h1>{isLoggedIn ? t("trips.cloneTrip.loggedIn.description") : t("trips.cloneTrip.notLoggedIn.description")}</h1>
            </div>

            <div className="flex flex-row w-full justify-evenly items-center">
              <Button color="primary" text={isLoggedIn ? t("trips.cloneTrip.loggedIn.submit") : t("trips.cloneTrip.notLoggedIn.submit")} onClick={onClone} />
              <Button className={styles.cancelButton} color="secondary" text={t("trips.cloneTrip.cancel")} onClick={onCancel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
