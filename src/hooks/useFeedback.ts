import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useFeedback = () => {
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const [feedbacks, setFeedbacks] = useState<Model.Feedbacks>();

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
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.SUCCESS, "feedback", "Send FeedBack", "Feedback sent successfuly!"));
      } catch {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "feedback", "Send FeedBack", "Something went wrong."));
      }
    },
    [dispatch]
  );

  return { loadingFeedback, feedbacks, feedbackAdd };
};

export default useFeedback;
