import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { INDEX, NOT_FOUND } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";

const NotFound = () => {
  const history = useHistory();

  const { t } = useTranslate();

  document.title = NOT_FOUND.TITLE(t("pageNotFound.title"));

  useEffect(() => {
    const timeOut = setTimeout(() => {
      history.push(INDEX.PATH);
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [history]);

  return (
    <>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h3 className="center">{t("pageNotFound.title")}</h3>
        <span className="center">{t("pageNotFound.description")}</span>
      </div>
    </>
  );
};

export default NotFound;
