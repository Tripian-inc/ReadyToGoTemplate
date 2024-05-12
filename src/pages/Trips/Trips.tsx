import React, { useEffect } from "react";
import { useHistory } from "react-router";

import { TRIPS, TRIP_PLAN, CREATE_TRIP, UPDATE_TRIP, TRAVEL_GUIDE, USE_TRIP_URL } from "../../constants/ROUTER_PATH_TITLE";

import TripList from "../../components/TripList/TripList";

import useUser from "../../hooks/useUser";
import useTrip from "../../hooks/useTrip";
import AppNav from "../../App/AppNav/AppNav";
import { CreateIconButton } from "@tripian/react";
import useTranslate from "../../hooks/useTranslate";
import classes from "./Trips.module.scss";

const TripsPage = () => {
  const { loadingTripReferences, tripReferences, userTripReferencesFetch } = useUser();
  const { loadingTripDelete, tripDelete, tripClear } = useTrip();

  const { t } = useTranslate();

  const history = useHistory();
  document.title = TRIPS.TITLE(t("trips.myTrips.title"));

  useEffect(() => {
    if (!window.tconfig.SHOW_HOME && window.tconfig.LOGIN_WITH_HASH) {
      history.replace(USE_TRIP_URL.PATH);
    } else if (!tripReferences) userTripReferencesFetch();
  }, [history, tripReferences, userTripReferencesFetch]);

  useEffect(() => {
    tripClear();
  }, [tripClear]);

  const cardClicked = (tripHash: string) => {
    let currentPath: string;
    if (window.tconfig.SHOW_TRAVEL_GUIDE) {
      currentPath = TRAVEL_GUIDE.PATH;
    } else {
      currentPath = TRIP_PLAN.PATH;
    }
    history.push(`${currentPath}/${tripHash}`);
  };

  const cardEditClicked = (tripHash: string) => {
    history.push(`${UPDATE_TRIP.PATH}/${tripHash}`);
  };

  const cardDeleteClicked = async (tripHash: string) => tripDelete(tripHash);
  return (
    <div className="background-full" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
      <AppNav header={TRIPS.HEADER?.(t("trips.myTrips.title")) || ""} />
      <div className="container mt10">
        <div className="row center">
          <TripList
            tripReferences={tripReferences || []}
            loadingTripReferences={loadingTripReferences || loadingTripDelete}
            cardClicked={cardClicked}
            cardEditClicked={cardEditClicked}
            cardDeleteClicked={(hash: string) => cardDeleteClicked(hash).then(() => true)}
            tripCreateClicked={() => history.push(CREATE_TRIP.PATH)}
          />
        </div>
        <div className={classes.tripCreateButton}>
          <CreateIconButton clicked={() => history.push(CREATE_TRIP.PATH)} />
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
