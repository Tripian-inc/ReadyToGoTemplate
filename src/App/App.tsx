import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorHandling from "./ErrorHandling";
import { helper } from "@tripian/model";
import AppRouter from "./AppRouter/AppRouter";
import * as gtag from "../gtag";
import useScript from "./useScript";
import Notify from "./Notify/Notify";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./App.scss";

const App = (): JSX.Element => {
  useScript(window.tconfig.GOOGLE_ANALYTICS_URL || "");
  const { getLocalData } = useLocalStorage<"light" | "dark">("theme");
  const theme = getLocalData();

  useEffect(() => {
    helper.setTheme(theme || window.tconfig.AVAILABLE_THEMES[0], window.tconfig.THEME);
    helper.setLogo(window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK, window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT);
    document.documentElement.style.setProperty("--font-family", window.tconfig.BRAND_NAME === "bookbarbados" ? "Herokid" : "Plus Jakarta Sans");
  }, [theme]);

  useEffect(() => {
    gtag.pageview(window.location.pathname);
    document.documentElement.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]);

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorHandling.ErrorFallback} onError={ErrorHandling.myErrorHandler} /* onReset={() => {}} */>
        <Notify />
        <AppRouter />
      </ErrorBoundary>
    </div>
  );
};

export default App;
