import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";
import useTranslate from "./useTranslate";

const useFeedback = () => {
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const [feedbacks, setFeedbacks] = useState<Model.Feedbacks>();

  const { t } = useTranslate();

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .feedbacks()
      .then((feedbacks: Model.Feedbacks) => {
        setFeedbacks(feedbacks);
      })

      .catch((feedBacksError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "feedback", "Fetch FeedBack", feedBacksError));
        throw feedBacksError;
      })
      .finally(() => {
        setLoadingFeedback(false);
      });
  }, [dispatch]);

  const feedbackAdd = useCallback(
    async (feedback: Model.FeedbackRequest) => {
      try {
        await api.feedbackSend(feedback);
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.SUCCESS, "feedback", t("notification.feedbackSuccess.message")));
      } catch {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "feedback", t("notification.feedbackError.message")));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  return { loadingFeedback, feedbacks, feedbackAdd };
};

export default useFeedback;
