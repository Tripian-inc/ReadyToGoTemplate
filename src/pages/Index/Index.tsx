import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { INDEX, LANDING } from "../../constants/ROUTER_PATH_TITLE";

const IndexPage = () => {
  const history = useHistory();

  document.title = INDEX.TITLE();

  useEffect(() => {
    if (window.tconfig.ROOT_PATH && window.tconfig.ROOT_PATH !== "") {
      history.replace(window.tconfig.ROOT_PATH);
    } else {
      history.replace(LANDING.PATH);
    }
  }, [history]);

  return <></>;
};

export default IndexPage;
