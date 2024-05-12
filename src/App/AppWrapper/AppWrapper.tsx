import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ICombinedState from "../../redux/model/ICombinedState";
import InitLoading from "../../components/InitLoading/InitLoading";
import App from "../App";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import { changeInitLoading } from "../../redux/action/layout";
import { initial, setConfigList } from "./init";
import { LanguageProvider } from "../LanguageProvider/LanguageProvider";

interface IAppWrapperStateProps {
  loading: boolean;
}

const AppWrapper = () => {
  const { loading } = useSelector<ICombinedState, IAppWrapperStateProps>((state: ICombinedState) => ({
    loading: state.layout.initLoading,
  }));

  const { userFetch } = useUser();
  const { loggedIn /* , logout */ } = useAuth();
  const dispatch = useDispatch();

  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    setConfigList().then(async (configList) => {
      setConfigReady(true);
    });
  }, []);

  useEffect(() => {
    if (configReady) {
      initial().then((tokenOk) => {
        if (tokenOk) {
          loggedIn();
          userFetch();
        }
        dispatch(changeInitLoading(false));
      });
    }
  }, [configReady, dispatch, loggedIn, userFetch]);

  return (
    <>
      {loading ? (
        <InitLoading />
      ) : (
        <LanguageProvider>
          <App />
        </LanguageProvider>
      )}
    </>
  );
};

export default AppWrapper;
