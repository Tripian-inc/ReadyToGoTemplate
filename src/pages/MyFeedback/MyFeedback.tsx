/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { PreLoading, UserFeedbacks } from "@tripian/react";
import { MY_FEEDBACK } from "../../constants/ROUTER_PATH_TITLE";
import { useHistory } from "react-router";
import { api } from "@tripian/core";
import AppNav from "../../App/AppNav/AppNav";
import Model from "@tripian/model";
import useTranslate from "../../hooks/useTranslate";
import classes from "./MyFeedback.module.scss";

const MyFeedback = () => {
  const history = useHistory();

  const { t } = useTranslate();

  document.title = MY_FEEDBACK.TITLE(t("user.myFeedback.title"));
  const [userFeed, setUserFeed] = useState<Model.UserFeedback[]>([]);
  const [userFeedbacksLoad, setUserFeedbacksLoad] = useState<boolean>(false);

  useEffect(() => {
    setUserFeedbacksLoad(true);
    api
      .userFeedbacks()
      .then((u) => {
        setUserFeed(u);
      })
      .finally(() => setUserFeedbacksLoad(false));
  }, []);

  if (userFeedbacksLoad) {
    return (
      <>
        <AppNav header={MY_FEEDBACK.HEADER?.(t("user.myFeedback.title"))} />
        <PreLoading />
      </>
    );
  }

  return (
    <div className="background-full" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
      <div className={classes.myFeedback}>
        <AppNav header={MY_FEEDBACK.HEADER?.(t("user.myFeedback.title"))} />

        {userFeed.length === 0 ? (
          <h3 className="center mt10">{t("user.myFeedback.warning")}</h3>
        ) : (
          <div className={` ${classes.myFeedbackWrapper} container mt10`}>
            <UserFeedbacks userFeedbacks={userFeed} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFeedback;
