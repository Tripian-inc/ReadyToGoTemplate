import React, { useState } from "react";
import Model from "@tripian/model";
import useTranslate from "../../hooks/useTranslate";
import { DeleteUser, DeleteUserSuccess } from "@tripian/react";
import { useHistory } from "react-router";
import { REGISTER } from "../../constants/ROUTER_PATH_TITLE";
import { api } from "@tripian/core";
import useAuth from "../../hooks/useAuth";
import { removeLocalStorageToken } from "../../App/AppWrapper/localStorages";
import { useDispatch } from "react-redux";
import { saveNotification } from "../../redux/action/user";

const DeleteUserPage = () => {
  const { logout } = useAuth();
  const { onSelectedLangCode } = useTranslate();

  const [success, setSuccess] = useState<boolean>(false);

  const dispatch = useDispatch();

  const { t } = useTranslate();

  const history = useHistory();

  const callbackSuccessLogin = () => {
    setSuccess(true);
  };

  const userDeleteFetch = async () => {
    try {
      return await api.userDelete();
    } catch (userDeleteError: any) {
      dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "userDelete", t("user.deleteUser.deleteBtn"), userDeleteError));
      throw userDeleteError;
    }
  };

  return (
    <div className="full-center">
      {success ? (
        <DeleteUserSuccess
          goRegister={() => {
            removeLocalStorageToken();
            logout();
            onSelectedLangCode("en");
            history.push(REGISTER.PATH);
          }}
          t={t}
        />
      ) : (
        <DeleteUser
          userDeleteCallback={userDeleteFetch}
          success={callbackSuccessLogin}
          goBack={() => {
            history.goBack();
          }}
          t={t}
        />
      )}
    </div>
  );
};

export default DeleteUserPage;
