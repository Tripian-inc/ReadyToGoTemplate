import React from "react";
import useTranslate from "../../hooks/useTranslate";
import useFeedback from "../../hooks/useFeedback";
import Model from "@tripian/model";
import { Feedback, PreLoading } from "@tripian/react";
import AppNav from "../../App/AppNav/AppNav";
import { FEEDBACK_PAGE } from "../../constants/ROUTER_PATH_TITLE";
import classes from "./FeedbackPage.module.scss";

const FeedbackPage = () => {
  const { loadingFeedback, feedbacks, feedbackAdd } = useFeedback();
  const { t } = useTranslate();

  const sendFeedback = (feedback: Model.FeedbackRequest) => {
    const newFeedback = { ...feedback };
    newFeedback.desc = feedback.desc.replace(/^\s+|\s+$/g, "");
    return feedbackAdd(newFeedback);
  };

  return (
    <div>
      <AppNav header={FEEDBACK_PAGE.HEADER?.(t("support.feedback.title"))} />

      {!loadingFeedback ? (
        <div className={classes.feedbackWrapper}>
          <div className={classes.feedbacks}>
            <Feedback feedbackSubjects={feedbacks?.mainSubjects || []} sendFeedback={sendFeedback} t={t} />
          </div>
        </div>
      ) : (
        <div className={classes.loadingWrapper}>
          <PreLoading />
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
