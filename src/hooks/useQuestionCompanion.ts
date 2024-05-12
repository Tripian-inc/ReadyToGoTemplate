import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useQuestionCompanion = () => {
  const [loadingQuestionsCompanion, setLoadingQuestionsCompanion] = useState<boolean>(true);
  const [questionsCompanion, setQuestionsCompanion] = useState<Model.Question[]>();

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .questionsCompanion()
      .then((pQuestions: Model.Question[]) => {
        setQuestionsCompanion(pQuestions);
      })

      .catch((questionsCompanionError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "questionCompanion", "Fetch Companion Questions", questionsCompanionError));
        throw questionsCompanionError;
      })
      .finally(() => {
        setLoadingQuestionsCompanion(false);
      });
  }, [dispatch]);

  return { loadingQuestionsCompanion, questionsCompanion };
};

export default useQuestionCompanion;
