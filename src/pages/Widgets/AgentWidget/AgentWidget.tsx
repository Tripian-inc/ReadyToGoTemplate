import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import moment from "moment";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { Copy, FormTemplateTripNextWidget, PreLoading } from "@tripian/react";
import * as gtag from "../../../gtag";
import { TRIP_PLAN } from "../../../constants/ROUTER_PATH_TITLE";
import { stepHeaders } from "../../../config/tripFormContents";
import useAuth from "../../../hooks/useAuth";
import useUser from "../../../hooks/useUser";
import useCities from "../../../hooks/useCities";
import useTranslate from "../../../hooks/useTranslate";
import classes from "./AgentWidget.module.scss";

const initialTripProfile: Model.TripProfile = {
  cityId: 0,
  arrivalDatetime: moment(new Date()).add(1, "days").set({ hour: 9, minute: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]"),
  departureDatetime: moment(new Date()).add(4, "days").set({ hour: 18, minute: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]"),
  answers: [],
  numberOfAdults: 1,
  companionIds: [],
  doNotGenerate: 1,
  excludeHash: [],
};

const AgentWidget = () => {
  const { isLoggedIn, loggedIn, logout } = useAuth();
  const { /* user, */ userFetch } = useUser();

  const { loadingCities, cities } = useCities();

  const { t } = useTranslate();

  const preLoading = isLoggedIn === false || loadingCities === true || cities === undefined;
  const [loadingTripAdd, setLoadingTripAdd] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [tripUrl, setTripUrl] = useState<string>();

  const [tripProfile, setTripProfile] = useState<Model.TripProfile>({ ...initialTripProfile, cityId: window.tconfig.DEFAULT_DESTINATION_ID ?? 0 });

  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };
  // /:widgetName/?userId=:userId
  const { userId } = useQuery<{ userId: string }>();

  useEffect(() => {
    logout();
  }, [logout]);

  useEffect(() => {
    console.log("userId", userId);
    if (isLoggedIn === false && userId && userId !== "") {
      api.lightRegisterLogin(userId).then(() => {
        loggedIn();
        return userFetch();
      });
    }
  }, [userId, isLoggedIn, loggedIn, userFetch]);

  const onSubmit = () => {
    setLoadingTripAdd(true);
    api
      .tripAdd(tripProfile, undefined)
      .then((tripData: Model.Trip) => {
        // TODO callback
        gtag.googleAnalyticsEvent("CreateTrip", { trip_hash: tripData.tripHash });
        callbackWidget(tripData);
      })
      .finally(() => {
        setLoadingTripAdd(false);
        setShowSuccessMessage(true);
      });
  };

  const callbackTripProfile = (tripProfileParam: Model.TripProfile) => {
    setTripProfile(tripProfileParam);
  };

  const callbackWidget = (tripData: Model.Trip) => {
    const tripUrl = `${window.location.origin}${TRIP_PLAN.PATH}/${tripData.tripHash}!l`;
    setTripUrl(tripUrl);
    // alert("Trip created! " + tripUrl);
    console.log(tripUrl);
    window.open(tripUrl);
  };

  // Render
  if (preLoading || loadingTripAdd) return <PreLoading />;

  return (
    <>
      {showSuccessMessage ? (
        <div className={classes.successMessage}>
          <span className={classes.successMessageHeader}>{t("trips.agentCreateNewTrip.tripCreated")}</span>
          {tripUrl && (
            <div className={classes.successMessageContent}>
              <span className={classes.tripUrl}>{tripUrl}</span>
              <Copy copyText={tripUrl} t={t} />
            </div>
          )}
        </div>
      ) : (
        <FormTemplateTripNextWidget
          cities={cities}
          tripProfile={tripProfile}
          uniqueUserId={userId}
          callbackTripProfile={callbackTripProfile}
          stepHeader={stepHeaders[0]}
          onSubmitText={t("trips.agentCreateNewTrip.form.submit")}
          onSubmit={onSubmit}
          t={t}
        />
      )}
    </>
  );
};

export default AgentWidget;
