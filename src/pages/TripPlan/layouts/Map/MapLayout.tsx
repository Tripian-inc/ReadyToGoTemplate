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
import { MapCategory } from "@tripian/react";
import ShowProviderTours from "./ShowProviderTours/ShowProviderTours";
import useRezdyApi from "../../../../hooks/useRezdyApi";
import useVidereoApi from "../../../../hooks/useVidereoApi";
import ShowProviderVideos from "./ShowProviderVideos/ShowProviderVideos";
import ShowProviderEvents from "./ShowProviderEvents/ShowProviderEvents";
import useVictoryEvents from "../../../../hooks/useVictoryEvents";
import classes from "./MapLayout.module.scss";

interface IMapLayout {
  tripReference: Model.TripReference;
  planDayIndex: number;
  fullWidth: boolean;
  alternativesStepId?: number;
  poiCategoryGroups: Model.PoiCategoryGroup[];
  offersSearchVisible: boolean;
  setOffersSearchVisible: (newVisible: boolean) => void;
  loadingSearchOffers: boolean;
  offersResult: Model.Poi[];
  searchOffer: () => Promise<Model.Poi[]>;
  selectedPoiCategoryIds: number[];
  setSelectedPoiCategoryIds: (selectedCategoryIds: number[]) => void;
  sharedTrip?: boolean;
  eventCardClicked: (eventid: number) => void;
  t: (value: Model.TranslationKey) => string;
}

const MapLayout: React.FC<IMapLayout> = ({
  tripReference,
  planDayIndex,
  fullWidth,
  alternativesStepId,
  poiCategoryGroups,
  offersSearchVisible,
  setOffersSearchVisible,
  loadingSearchOffers,
  offersResult,
  searchOffer,
  selectedPoiCategoryIds,
  setSelectedPoiCategoryIds,
  sharedTrip = false,
  eventCardClicked,
  t,
}) => {
  // const day = useSelector((state: ICombinedState) => state.trip.day);
  const { tripReadOnly } = useTrip();
  const { plans } = usePlan();

  const { loadingRezdyTours, rezdyProducts } = useRezdyApi(tripReference.city.id);
  const { loadingVidereoVideos, videreoVideos } = useVidereoApi(tripReference.city.id);
  const { loadingVictoryEventCatalog, victoryEvents } = useVictoryEvents(
    tripReference.city.coordinate.lat,
    tripReference.city.coordinate.lng,
    tripReference.tripProfile.arrivalDatetime,
    tripReference.tripProfile.departureDatetime
  );

  const [showAllalternatives, setShowAllalternatives] = useState<boolean>(false);
  const [searchThisAreaPois, setSearchThisAreaPois] = useState<Model.Poi[]>([]);
  // const { offersSearchVisible, setOffersSearchVisible } = useLayoutPlan();
  const [showAccommodations, setShowAccommodations] = useState<boolean>(false);
  const [showCarRentOffers, setShowCarRentOffers] = useState<boolean>(false);
  const [showProviderTours, setShowProviderTours] = useState<boolean>(false);
  const [showProviderVideos, setShowProviderVideos] = useState<boolean>(false);
  const [showProviderEvents, setShowProviderEvents] = useState<boolean>(false);

  // useEffect(() => {
  //   setShowAllalternatives(false);
  // }, [day]);

  const mapClasses = [classes.mapContainer];
  if (!window.tconfig.SHOW_OVERVIEW) mapClasses.push("container-height");
  else mapClasses.push("container-height-tab");
  if (fullWidth) mapClasses.push(classes.wm100);

  const isWithinBounds = (entry: { lat: number; lng: number }, bounds: { north: number; south: number; west: number; east: number }): boolean => {
    return bounds.south <= entry.lat && entry.lat <= bounds.north && bounds.west <= entry.lng && entry.lng <= bounds.east;
  };

  const filteredVideos = useMemo(() => {
    return videreoVideos.filter((entry) =>
      isWithinBounds(entry, {
        north: tripReference.city.boundary[1],
        south: tripReference.city.boundary[0],
        west: tripReference.city.boundary[2],
        east: tripReference.city.boundary[3],
      })
    );
  }, [videreoVideos, tripReference.city.boundary]);

  const googleMap = useMemo(
    () => (
      <Gmap
        planDayIndex={planDayIndex}
        showAllalternatives={showAllalternatives}
        alternativesStepId={alternativesStepId}
        searchThisAreaPois={searchThisAreaPois}
        showAccommodations={showAccommodations}
        showCarRentOffers={showCarRentOffers}
        showProviderTours={showProviderTours}
        showProviderVideos={showProviderVideos}
        showProviderEvents={showProviderEvents}
        cycling={tripReference.tripProfile.answers.includes(407)}
        hideRoutes={sharedTrip && window.tconfig.WIDGET_THEME_1}
        selectedPoiCategoryIds={selectedPoiCategoryIds}
        rezdyProducts={rezdyProducts}
        videreoVideos={filteredVideos}
        victoryEvents={victoryEvents}
        eventCardClicked={eventCardClicked}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      alternativesStepId,
      planDayIndex,
      searchThisAreaPois,
      sharedTrip,
      showAccommodations,
      showAllalternatives,
      showCarRentOffers,
      showProviderTours,
      showProviderVideos,
      showProviderEvents,
      tripReference.tripProfile.answers,
      selectedPoiCategoryIds,
      rezdyProducts,
      filteredVideos,
      victoryEvents,
    ]
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

  const showShowProviderTours = useMemo(() => {
    const endTripDatetime = moment(tripReference.tripProfile.departureDatetime).format("X");
    const datetimeNow = moment(new Date()).format("X");
    return (
      window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.REZDY) &&
      (tripReference.city.id === 625 || tripReference.city.id === 341) &&
      datetimeNow < endTripDatetime
    );
  }, [tripReference]);

  const showShowProviderEvents = useMemo(() => {
    const endTripDatetime = moment(tripReference.tripProfile.departureDatetime).format("X");
    const datetimeNow = moment(new Date()).format("X");
    return window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VICTORY) && datetimeNow < endTripDatetime;
  }, [tripReference]);

  const showShowProviderVideos = useMemo(() => {
    const isCorrectDomain = window.location.hostname === "trial-dev.tripian.com";
    return tripReference.city.id === 659 && isCorrectDomain;
  }, [tripReference]);

  return (
    <div className={mapClasses.join(" ")}>
      {googleMap}
      <CurrentLocation />
      {sharedTrip && window.tconfig.WIDGET_THEME_1 && plans ? (
        <>
          <div className={classes.mapCategories}>
            <MapCategory
              categoryGroups={poiCategoryGroups.filter((poiCategory) =>
                plans[0].steps.some((step) => step.poi.category.some((category) => poiCategory.categories.some((c) => c.id === category.id)))
              )}
              selectedPoiCategoryIds={selectedPoiCategoryIds}
              setSelectedPoiCategoryIds={(newIndex: number[]) => setSelectedPoiCategoryIds(newIndex)}
              clearCategories={() => setSelectedPoiCategoryIds([])}
              t={t}
            />
          </div>
          <div className={classes.mapLeftTopContainer}>
            {window.tconfig.SHOW_OFFERS && (
              <ShowSearchOffers
                show={offersSearchVisible}
                setShow={setOffersSearchVisible}
                setSearchThisAreaPois={setSearchThisAreaPois}
                loadingSearchOffers={loadingSearchOffers}
                offersResult={offersResult}
                searchOffer={searchOffer}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <MapSearch show setSearchThisAreaPois={setSearchThisAreaPois} poiCategoryGroups={poiCategoryGroups} />

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
            {showShowProviderTours && <ShowProviderTours loading={loadingRezdyTours} show={showProviderTours} setShow={setShowProviderTours} />}
            {showShowProviderVideos && <ShowProviderVideos loading={loadingVidereoVideos} show={showProviderVideos} setShow={setShowProviderVideos} />}
            {showShowProviderEvents && <ShowProviderEvents loading={loadingVictoryEventCatalog} show={showProviderEvents} setShow={setShowProviderEvents} />}
          </div>
        </>
      )}
      {plans && <PlanRoute planId={plans[planDayIndex].id} tripHash={tripReference.tripHash} />}
    </div>
  );
};

export default MapLayout;
