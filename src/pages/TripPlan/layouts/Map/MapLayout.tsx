/* eslint-disable react/require-default-props */

import React, { useMemo, useState } from "react";
import moment from "moment";
import Model from "@tripian/model";

import Gmap from "../../components/Gmap/GMap";
import MapSearch from "./MapSearch/MapSearch";
import CurrentLocation from "./CurrentLocation/CurrentLocation";
import ShowAllAlternatives from "./ShowAllAlternatives/ShowAllAlternatives";

import ShowSearchOffers from "./ShowSearchOffers/ShowSearchOffers";
import ShowAccommodations from "./ShowAccommodations/ShowAccommodations";
import ShowCarRentOffers from "./ShowCarRentOffers/ShowCarRentOffers";
// import useLayoutPlan from "../../hooks/useLayoutPlan";
import PlanRoute from "./PlanRoute/PlanRoute";
import useTrip from "../../../../hooks/useTrip";
import usePlan from "../../../../hooks/usePlan";
import classes from "./MapLayout.module.scss";

interface IMapLayout {
  tripReference: Model.TripReference;
  planDayIndex: number;
  fullWidth: boolean;
  alternativesStepId?: number;
  poiCategories: Model.PoiCategory[];
  offersSearchVisible: boolean;
  setOffersSearchVisible: (newVisible: boolean) => void;
  loadingSearchOffers: boolean;
  offersResult: Model.Poi[];
  searchOffer: () => Promise<Model.Poi[]>;
}

const MapLayout: React.FC<IMapLayout> = ({
  tripReference,
  planDayIndex,
  fullWidth,
  alternativesStepId,
  poiCategories,
  offersSearchVisible,
  setOffersSearchVisible,
  loadingSearchOffers,
  offersResult,
  searchOffer,
}) => {
  // const day = useSelector((state: ICombinedState) => state.trip.day);
  const { tripReadOnly } = useTrip();
  const { plans } = usePlan();

  const [showAllalternatives, setShowAllalternatives] = useState<boolean>(false);
  const [searchThisAreaPois, setSearchThisAreaPois] = useState<Model.Poi[]>([]);
  // const { offersSearchVisible, setOffersSearchVisible } = useLayoutPlan();
  const [showAccommodations, setShowAccommodations] = useState<boolean>(false);
  const [showCarRentOffers, setShowCarRentOffers] = useState<boolean>(false);

  // useEffect(() => {
  //   setShowAllalternatives(false);
  // }, [day]);

  const mapClasses = [classes.mapContainer];
  if (!window.tconfig.SHOW_OVERVIEW) mapClasses.push("container-height");
  else mapClasses.push("container-height-tab");
  if (fullWidth) mapClasses.push(classes.wm100);

  const googleMap = useMemo(
    () => (
      <Gmap
        planDayIndex={planDayIndex}
        showAllalternatives={showAllalternatives}
        alternativesStepId={alternativesStepId}
        searchThisAreaPois={searchThisAreaPois}
        showAccommodations={showAccommodations}
        showCarRentOffers={showCarRentOffers}
        cycling={tripReference.tripProfile.answers.includes(407)}
      />
    ),
    [alternativesStepId, planDayIndex, searchThisAreaPois, showAccommodations, showAllalternatives, showCarRentOffers, tripReference.tripProfile.answers]
  );
  const showShowAccommodations = useMemo(() => {
    const startTripDatetime = moment(tripReference.tripProfile.arrivalDatetime).format("X");
    const datetimeNow = moment(new Date()).format("X");
    return window.tconfig.SHOW_ACCOMMODATION_POIS && datetimeNow < startTripDatetime;
  }, [tripReference]);

  const showShowCarRentOffes = useMemo(() => {
    const startTripDatetime = moment(tripReference.tripProfile.arrivalDatetime).format("X");
    const datetimeNow = moment(new Date()).format("X");
    return window.tconfig.SHOW_CAR_RENT_POIS && datetimeNow < startTripDatetime;
  }, [tripReference]);

  return (
    <div className={mapClasses.join(" ")}>
      {googleMap}
      <MapSearch show setSearchThisAreaPois={setSearchThisAreaPois} poiCategories={poiCategories} />
      <CurrentLocation />
      <ShowAllAlternatives show={showAllalternatives} setShow={setShowAllalternatives} />
      <div className={classes.mapLeftTopContainer}>
        {window.tconfig.SHOW_OFFERS && tripReadOnly === false && (
          <ShowSearchOffers
            show={offersSearchVisible}
            setShow={setOffersSearchVisible}
            setSearchThisAreaPois={setSearchThisAreaPois}
            loadingSearchOffers={loadingSearchOffers}
            offersResult={offersResult}
            searchOffer={searchOffer}
          />
        )}
        {showShowAccommodations && <ShowAccommodations show={showAccommodations} setShow={setShowAccommodations} />}
        {showShowCarRentOffes && <ShowCarRentOffers show={showCarRentOffers} setShow={setShowCarRentOffers} />}
      </div>
      {plans && <PlanRoute planId={plans[planDayIndex].id} tripHash={tripReference.tripHash} />}
    </div>
  );
};

export default MapLayout;
