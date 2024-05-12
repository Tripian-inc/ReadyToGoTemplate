import React, { useEffect, useState } from "react";

import Model from "@tripian/model";
import { FormTemplateCompanion, PreLoading, UserCompanions, Button, Notification } from "@tripian/react";

import { TRAVEL_COMPANIONS } from "../../constants/ROUTER_PATH_TITLE";
import useCompanionQuestions from "../../hooks/useQuestionCompanion";
import useCompanion from "../../hooks/useCompanion";
import AppNav from "../../App/AppNav/AppNav";
import useTranslate from "../../hooks/useTranslate";
import classes from "./TravelCompanions.module.scss";

const initialCompanionRequestState: Model.CompanionRequest = { age: 0, name: "", answers: [], title: "Family member" };

const TravelCompanions = () => {
  // local state
  const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);
  const [userCompanionState, setUserCompanionState] = useState<Model.CompanionRequest>(initialCompanionRequestState);

  // custom hooks
  const { questionsCompanion, loadingQuestionsCompanion } = useCompanionQuestions();
  const {
    loadingCompanions,
    companionsFetch,
    companions,
    companionAdd,
    companionDelete,
    companionUpdate,
    loadingCompanionAdd,
    companionUpdateLoadingList,
    companionDeleteLoadingList,
  } = useCompanion();

  const { t } = useTranslate();

  document.title = TRAVEL_COMPANIONS.TITLE(t("user.travelCompanions.title"));

  useEffect(() => {
    companionsFetch();
  }, [companionsFetch]);

  const isDoneButtonDisabled = !userCompanionState.name.trim() || !userCompanionState.age;

  if (loadingQuestionsCompanion || loadingCompanions) {
    return (
      <>
        <AppNav header={TRAVEL_COMPANIONS.HEADER?.(t("user.travelCompanions.title"))} />
        <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
      </>
    );
  }
  return (
    <div className="background-full" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
      <AppNav header={TRAVEL_COMPANIONS.HEADER?.(t("user.travelCompanions.title"))} />
      <div className="container pt8">
        <div className="row">
          <div className={`${classes.travelCompanionsFormWrapper} col col12`}>
            {loadingCompanionAdd ? (
              <div className={classes.travelCompanionsFormLoading}>
                <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
              </div>
            ) : null}
            {/** TODO Add companion, Edit companion forms split */}
            <FormTemplateCompanion
              userCompanion={userCompanionState as Model.Companion}
              questions={questionsCompanion || []}
              callbackFormTemplateCompanion={(userCompanion) => {
                setUserCompanionState(userCompanion);
              }}
              t={t}
            />
            <div className="center">
              <Button
                text={t("user.travelCompanions.submit").toUpperCase()}
                color={isDoneButtonDisabled ? "disabled" : "primary"}
                disabled={isDoneButtonDisabled}
                onClick={() => {
                  companionAdd(userCompanionState);
                  setUserCompanionState(initialCompanionRequestState);
                }}
              />
            </div>
          </div>
          <div className={`${classes.travelCompanionsFormWrapper} col col12`}>
            <UserCompanions
              companions={companions || []}
              questions={questionsCompanion || []}
              companionLoadingList={companionUpdateLoadingList.concat(companionDeleteLoadingList)}
              deleteCompanion={(companionId) => {
                companionDelete(companionId);
              }}
              editCompanion={(companion) => {
                /** TODO Companion callback model diff
                 * @Ahmet
                 */
                companionUpdate(companion);
              }}
              showWarningMessage={(show) => {
                setShowWarningMessage(show);
              }}
              t={t}
            />
          </div>
        </div>
      </div>
      {showWarningMessage ? (
        <Notification
          type="warning"
          positionX="center"
          positionY="top"
          title={t("notification.changeCompanionWarning.title")}
          message={t("notification.changeCompanionWarning.message")}
          onClose={() => {
            setShowWarningMessage(false);
          }}
          closeMs={3500}
        />
      ) : null}
    </div>
  );
};

export default TravelCompanions;
