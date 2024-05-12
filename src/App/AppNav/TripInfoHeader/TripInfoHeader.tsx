import React from "react";
import { ButtonIcons, BUTTON_TYPES } from "@tripian/react";
import { useHistory } from "react-router";
import moment from "moment";
import { UPDATE_TRIP as UPDATE_TRIP_PATH_TITLE } from "../../../constants/ROUTER_PATH_TITLE";
import useTrip from "../../../hooks/useTrip";
import classes from "./TripInfoHeader.module.scss";
/**
 * Travel Guide
 * Trip Plan
 */
const TripInfoHeader = () => {
  const { tripReference } = useTrip();
  const history = useHistory();

  if (tripReference === undefined) return null;

  const hash = tripReference.tripHash;
  const cityName = tripReference.city.name;
  const tripArrivalDatetimeMoment = moment(tripReference.tripProfile.arrivalDatetime).utcOffset(0);
  const tripDepartureDatetimeMoment = moment(tripReference.tripProfile.departureDatetime).utcOffset(0);
  const lastTripDatetime = moment(tripReference.tripProfile.departureDatetime).format("X");
  const datetimeNow = moment(new Date()).format("X");

  return (
    <div className={classes.daySwitch}>
      <div className={classes.cityName}>
        <span className={classes.cityNameSpan}>{cityName}</span>
        {datetimeNow <= lastTripDatetime ? (
          <div className={classes.editIcon}>
            <ButtonIcons.Edit
              color="primary"
              type={BUTTON_TYPES.TEXT}
              iconSize="1rem"
              onClick={() => {
                history.push(`${UPDATE_TRIP_PATH_TITLE.PATH}/${hash}`);
              }}
              /* className="hide-s" */
            />
          </div>
        ) : null}
      </div>
      <div>
        <span>
          {tripArrivalDatetimeMoment.format("MMMM DD")}-{tripDepartureDatetimeMoment.format("DD")}, {tripDepartureDatetimeMoment.format("YYYY")}
        </span>
      </div>
    </div>
  );
};

export default TripInfoHeader;
