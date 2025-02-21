import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Checkbox, FormTemplateProfile, PreLoading /*  ToggleSwitch */ } from "@tripian/react";
import { api, easy } from "@tripian/core";
import Model from "@tripian/model";
import { useHistory } from "react-router";
import ICombinedState from "../../redux/model/ICombinedState";

import { DELETE_USER, USER_PROFILE, USE_TRIP_URL } from "../../constants/ROUTER_PATH_TITLE";
import { changeUser } from "../../redux/action/user";
import useQuestionProfile from "../../hooks/useQuestionProfile";
import AppNav from "../../App/AppNav/AppNav";
import { getLocalStorageToken } from "../../App/AppWrapper/localStorages";
import useNotificationSettings from "../../hooks/useNotificationSettings";
import useTranslate from "../../hooks/useTranslate";
import classes from "./UserProfile.module.scss";

const UserProfile = () => {
  const { loadingNotificationSettings, notificationSettings, isLoadingNotificationSettingUpdate, updateNotificationsSetting } = useNotificationSettings();
  const { loadingQuestionsProfile, questionsProfile } = useQuestionProfile();
  const user = useSelector((state: ICombinedState) => state.user.user);
  const dispatch = useDispatch();
  const history = useHistory();

  const { t } = useTranslate();

  document.title = USER_PROFILE.TITLE(t("user.profile"));

  useEffect(() => {
    const redirectToUseTripUrl = () => {
      history.replace(USE_TRIP_URL.PATH);
    };

    if (!window.tconfig.SHOW_USER_PROFILE && window.tconfig.LOGIN_WITH_HASH) {
      redirectToUseTripUrl();
    }
  }, [history]);

  const isSocialUser = useMemo(() => {
    try {
      const token = getLocalStorageToken();
      if (token) {
        const tokenPayload: Model.TokenPayload | undefined = easy.parseToken(token);
        return tokenPayload?.["cognito:username"].split("").includes("_") ?? false;
      }

      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const updateCallback = (updatedUser: Model.User) => {
    dispatch(changeUser(updatedUser));
  };

  const update = (value: Model.UserUpdateRequest) => api.userUpdate(value);

  if (!user) return null;

  return (
    <div className="background-full" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
      <AppNav header={USER_PROFILE.HEADER?.(t("user.profile"))} />

      {loadingQuestionsProfile ? (
        <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
      ) : (
        <div className="container mt10">
          <div className={`${classes.userProfileFormWrapper} row center`}>
            <div className="flex flex-col center">
              <FormTemplateProfile
                user={user}
                profileQuestions={questionsProfile || []}
                updateUser={update}
                updateCallback={updateCallback}
                cancel={() => {
                  history.goBack();
                }}
                canChangePassword={!isSocialUser && window.tconfig.SHOW_CHANGE_PASSWORD}
                forgotPassword={() => history.push("/forgot-password")}
                t={t}
              />

              {window.tconfig.SHOW_NOTIFICATION_SETTINGS && loadingNotificationSettings === false && 0 < notificationSettings.length && (
                <>
                  <div className="font-bold">{t("user.profile.notificationSettings")}</div>
                  <div className="flex flex-col">
                    {notificationSettings.map((ns) => {
                      return (
                        <div key={ns.id} className="flex row justify-between items-center w-full h-14 px-4 my-0">
                          <h2>{ns.name}</h2>
                          {/* <div>{ns.checked ? "true" : "false"}</div> */}
                          {/* <Checkbox text={ns.name} domId={ns.id.toString()} checked={ns.checked} onChange={() => {}} /> */}
                          {isLoadingNotificationSettingUpdate(ns.id) ? (
                            <div className="pr-7">
                              <PreLoading size="small" />
                            </div>
                          ) : (
                            <>
                              {/* <ToggleSwitch
                                domId={`${ns.id}-toggle`}
                                checked={ns.checked}
                                onChange={(v) => {
                                  updateNotificationsSetting(ns.id, v);
                                }}
                                optionLabels={["Ok", "None"]}
                              /> */}
                              <Checkbox
                                text={""}
                                domId={ns.id.toString()}
                                checked={ns.checked}
                                onChange={(v) => {
                                  updateNotificationsSetting(ns.id, v);
                                }}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="text-center my-3">
                <Button color="primary" text={t("user.deleteUser.deleteBtn")} onClick={() => history.push(DELETE_USER.PATH)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
