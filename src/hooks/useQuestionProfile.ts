import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useQuestionProfile = () => {
  const [loadingQuestionsProfile, setLoadingQuestionsProfile] = useState<boolean>(true);
  const [questionsProfile, setQuestionsProfile] = useState<Model.Question[]>();

  const dispatch = useDispatch();

  useEffect(() => {
    api
      .questionsProfile()
      .then((pQuestions: Model.Question[]) => {
        setQuestionsProfile(pQuestions);
      })

      .catch((questionsProfileError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "questionProfile", "Fetch Profile Questions", questionsProfileError));
        throw questionsProfileError;
      })
      .finally(() => {
        setLoadingQuestionsProfile(false);
      });
  }, [dispatch]);

  return { loadingQuestionsProfile, questionsProfile };
};

export default useQuestionProfile;
