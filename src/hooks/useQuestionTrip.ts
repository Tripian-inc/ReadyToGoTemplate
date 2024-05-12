import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useQuestionTrip = () => {
  const [loadingQuestionsTrip, setLoadingQuestionsTrip] = useState<boolean>(true);
  const [questionsTrip, setQuestionsTrip] = useState<Model.Question[]>();

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .questionsTrip()
      .then((pQuestions: Model.Question[]) => {
        setQuestionsTrip(pQuestions);
      })

      .catch((questionsTripError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "questionTrip", "Fetch Trip Questions", questionsTripError));
        throw questionsTripError;
      })
      .finally(() => {
        setLoadingQuestionsTrip(false);
      });
  }, [dispatch]);

  return { loadingQuestionsTrip, questionsTrip };
};

export default useQuestionTrip;
