import React from "react";
import { USE_TRIP_URL } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";

const UseTripUrlPage = () => {
  const { t } = useTranslate();

  document.title = USE_TRIP_URL.TITLE(t("useTripUrl.header"));

  return (
    <>
      <div className="full-center" style={{ maxWidth: "100%", textAlign: "center" }}>
        <h3>To access your trip, please use the URL you&apos;ve received by email.</h3>
      </div>
    </>
  );
};

export default UseTripUrlPage;
