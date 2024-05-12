import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FormTemplateNewPassword, ResetPasswordApproved } from "@tripian/react";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import useTranslate from "../../hooks/useTranslate";
import { FORGOT_PASSWORD, LOGIN } from "../../constants/ROUTER_PATH_TITLE";

const NewPasswordPage = () => {
  const [success, setSuccess] = useState<boolean>(false);

  const { t } = useTranslate();

  const history = useHistory();
  const { hash } = useParams<{ hash: string }>();

  document.title = FORGOT_PASSWORD.TITLE(t("auth.forgotPassword.header"));

  const callbackSuccessLogin = (userResetPassword: Model.UserResetPassword) => {
    setSuccess(true);
  };

  return (
    <div className="full-center">
      {success ? (
        <ResetPasswordApproved goBackLogin={() => history.push(LOGIN.PATH)} t={t} />
      ) : (
        <FormTemplateNewPassword passwordCallBack={(password: string) => api.userUpdatePassword(password, hash)} success={callbackSuccessLogin} t={t} />
      )}
    </div>
  );
};

export default NewPasswordPage;
