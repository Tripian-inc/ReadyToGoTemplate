import React, { useState } from "react";
import useTranslate from "../../hooks/useTranslate";
import { DeleteUser, DeleteUserSuccess } from "@tripian/react";
import { useHistory } from "react-router";
import { REGISTER } from "../../constants/ROUTER_PATH_TITLE";
import { api } from "@tripian/core";
import useAuth from "../../hooks/useAuth";
import { removeLocalStorageToken } from "../../App/AppWrapper/localStorages";

const DeleteUserPage = () => {
  const { logout } = useAuth();

  const [success, setSuccess] = useState<boolean>(false);

  const { t } = useTranslate();

  const history = useHistory();

  const callbackSuccessLogin = () => {
    setSuccess(true);
  };

  return (
    <div className="full-center">
      {success ? (
        <DeleteUserSuccess
          goRegister={() => {
            removeLocalStorageToken();
            logout();
            history.push(REGISTER.PATH);
          }}
          t={t}
        />
      ) : (
        <DeleteUser
          userDeleteCallback={() => api.userDelete()}
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
