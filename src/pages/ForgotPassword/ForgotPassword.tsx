import React, { useState } from "react";
import { useHistory } from "react-router";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { FormTemplateResetPassword, ResetPasswordEmail } from "@tripian/react";
import useTranslate from "../../hooks/useTranslate";
import { FORGOT_PASSWORD, LOGIN, NEW_PASSWORD } from "../../constants/ROUTER_PATH_TITLE";

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState<boolean>(false);

  const { t } = useTranslate();

  const history = useHistory();

  document.title = FORGOT_PASSWORD.TITLE(t("auth.forgotPassword.header"));

  const callbackSuccessLogin = (userResetPassword: Model.UserResetPassword) => {
    setSuccess(true);
  };

  return (
    <>
      <div className="full-center">
        {success ? (
          <ResetPasswordEmail goBack={() => history.push("/login")} t={t} />
        ) : (
          <>
            <FormTemplateResetPassword
              emailCallBack={(email) => {
                return api.userResetPassword(email, `${window.location.origin}${NEW_PASSWORD.PATH}/`);
              }}
              success={callbackSuccessLogin}
              goBack={() => history.push(LOGIN.PATH)}
              t={t}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ForgotPasswordPage;
