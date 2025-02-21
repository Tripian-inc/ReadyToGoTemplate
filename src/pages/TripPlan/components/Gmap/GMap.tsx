import React, { useMemo, useCallback, FC, useEffect } from "react";
import { useDispatch } from "react-redux";

import Model, { Providers, helper } from "@tripian/model";
import { GoogleMaps } from "@tripian/react";
import {
  handleMapClick,
  /* handleClickMarkerStep, */
  /* handleFocusChangeAlternative, */
  changeLegs,
  changedCenter,
  changedZoom,
  changedBoundry,
} from "../../../../redux/action/gmaps";
// import { changeFocusInfoVisible } from '../../../../redux/action/layout';

// import GoogleMaps from '../../../../components/GoogleMaps/GoogleMaps';

import useTrip from "../../../../hooks/useTrip";
import usePlan from "../../../../hooks/usePlan";
import useAlternative from "../../../../hooks/useAlternative";
import IStepAlternatives from "../../../../models/IStepAlternatives";
import useFocus from "../../../../hooks/useFocus";
import useProviderPois from "../../../../hooks/useProviderPois";
import useCarRentOffer from "../../../../hooks/useCarRentOffer";

const getAccommendationStep = (accommendation: Model.Accommodation): Model.Step => {
  const accommendationPoi: Model.Poi = {
    id: "",
    name: accommendation.name || "AccommendationState Name",
    description: accommendation.address || "AccommendationState Address",
    coordinate: accommendation.coordinate || { lat: 0, lng: 0 },
    //
    cityId: 0,
    image: {
      url: "",
      imageOwner: { title: "", url: "" /* avatar: "" */ },
      width: null,
      height: null,
    },
    gallery: [],
    price: 5,
    rating: 5,
    ratingCount: 0,
    web: null,
    phone: null,
    address: "",
    icon: "Homebase",
    bookings: [],
    category: [],
    tags: [],
    mustTries: [],
    cuisines: null,
    attention: null,
    hours: null,
    closed: [],
    distance: null,
    status: true,
    safety: [],
    offers: [],
  };

  const accommendationStep: Model.Step = {
    id: 0,
    poi: accommendationPoi,
    alternatives: [],
    order: -1,
    score: null,
    scoreDetails: [],
    times: { from: "", to: "" },
    warningMessage: [],
    stepType: "poi",
  };

  return accommendationStep;
};

interface IGMap {
  planDayIndex: number;
  alternativesStepId?: number;
  showAllalternatives: boolean;
  searchThisAreaPois: Model.Poi[];
  showAccommodations: boolean;
  showCarRentOffers: boolean;
  showProviderTours: boolean;
  showProviderVideos: boolean;
  showProviderEvents: boolean;
  rezdyProducts: Providers.Rezdy.Product[];
  videreoVideos: Providers.Videreo.ResponseResult[];
  victoryEvents: Providers.Victory.Event[];
  eventCardClicked: (eventid: number) => void;
  cycling?: boolean;
  hideRoutes?: boolean;
  selectedPoiCategoryIds: number[];
}

const GMap: FC<IGMap> = ({
  planDayIndex,
  alternativesStepId,
  showAllalternatives,
  searchThisAreaPois,
  showAccommodations,
  showCarRentOffers,
  showProviderTours,
  showProviderVideos,
  showProviderEvents,
  rezdyProducts,
  videreoVideos,
  victoryEvents,
  eventCardClicked,
  cycling,
  hideRoutes,
  selectedPoiCategoryIds,
}) => {
  const { tripReference } = useTrip();
  const { planDay } = usePlan();
  const { alternatives } = useAlternative();
  const { bbAccommodationHotelOffers } = useProviderPois(tripReference);
  const { bbCarRentOffers } = useCarRentOffer(tripReference);
  const { focus, focusStep, focusPoi, focusProviderPoi, focusCarRentOffer, focusProviderTour, focusProviderVideo, focusProviderEvent, focusLost } = useFocus();

  const plan = useMemo(() => planDay(planDayIndex), [planDay, planDayIndex]);

  const dispatch = useDispatch();

  const cityBounds = useMemo(() => {
    // console.log('cityBounds memo', tripReference?.city);
    // {south: -50, west: -100, north:50, east: 100}
    const cityBoundsNumbers = tripReference?.city.boundary || [-100, -50, 50, 100];
    const result = {
      north: cityBoundsNumbers[1],
      south: cityBoundsNumbers[0],
      west: cityBoundsNumbers[2],
      east: cityBoundsNumbers[3],
    };

    if (tripReference) {
      setTimeout(() => {
        if (window.twindow.map && !window.twindow.planBounds) {
          window.twindow.map.fitBounds(result);
        }
      }, 100);
    }

    return result;
  }, [tripReference]);

  const stepsMemo = useMemo(() => {
    let steps: Model.Step[] = [];

    if (plan && plan.generatedStatus !== 0) {
      steps = plan.steps;

      if (selectedPoiCategoryIds.length > 0) {
        steps = steps.filter((step) => step.poi.category.some((category) => selectedPoiCategoryIds.includes(category.id)));
      }
    } else {
      return [];
    }

    // console.log('GMap.stepsMemo useMemo called', steps, accommodation);

    /**
     * TODO
     * @PenguenUmut
     *
     * accommendation:{} gelme ihtimaline karşı sigorta.
     * */
    if (
      tripReference &&
      tripReference.tripProfile.accommodation &&
      tripReference.tripProfile.accommodation.coordinate &&
      !(tripReference.tripProfile.accommodation.coordinate.lat === 0 && tripReference.tripProfile.accommodation.coordinate.lng === 0) &&
      !hideRoutes
    ) {
      const accommendationStep = getAccommendationStep(tripReference.tripProfile.accommodation);
      const stepsWithAccommendation = [accommendationStep, ...steps];

      // if (stepsWithAccommendation.length > 0) stepsWithAccommendation.push(accommendationStep);
      return stepsWithAccommendation;
    }

    return steps;
  }, [plan, tripReference, hideRoutes, selectedPoiCategoryIds]);

  const alternativesMemo = useMemo(() => {
    // console.log('GMap.alternativesMemo useMemo called', steps, showAllalternatives, alternatives, alternativesStepId);

    // tripData undefined
    if (plan && alternatives) {
      // Map button (show all alternatives)
      if (showAllalternatives)
        return helper.removeDuplicateValuesById<Model.Poi>(
          alternatives.reduce<Model.Poi[]>((preValues: Model.Poi[], currentValues: IStepAlternatives) => preValues.concat(currentValues.pois), [])
        );

      // Clicked show alternatives on StepCard
      if (alternativesStepId) {
        const stepAlternatives = alternatives.find((alternative: IStepAlternatives) => alternative.stepId === alternativesStepId);
        if (stepAlternatives) return stepAlternatives.pois;
      }
    }

    return [];
  }, [alternatives, alternativesStepId, plan, showAllalternatives]);

  useEffect(() => {
    if (hideRoutes && plan && plan.steps.length !== 0) {
      const bounds = new google.maps.LatLngBounds();

      plan.steps.forEach((step) => {
        const coordinate = step.poi.coordinate;
        if (coordinate?.lat && coordinate?.lng) {
          bounds.extend(new google.maps.LatLng(coordinate.lat, coordinate.lng));
        }
      });

      setTimeout(() => {
        if (window.twindow.map && !bounds.isEmpty()) {
          window.twindow.map.fitBounds(bounds);
        }
      }, 200);
    }
  }, [hideRoutes, plan]);

  useEffect(() => {
    if (searchThisAreaPois.length !== 0) {
      const bounds: google.maps.LatLngBoundsLiteral = {
        east: 200,
        west: 200,
        north: 200,
        south: 200,
      };

      searchThisAreaPois.forEach((x) => {
        bounds.west = bounds.west === 200 ? x.coordinate.lng : Math.min(bounds.east, x.coordinate.lng);
        bounds.east = bounds.east === 200 ? x.coordinate.lng : Math.max(bounds.west, x.coordinate.lng);

        bounds.south = bounds.south === 200 ? x.coordinate.lat : Math.min(bounds.south, x.coordinate.lat);
        bounds.north = bounds.north === 200 ? x.coordinate.lat : Math.max(bounds.north, x.coordinate.lat);
      });

      window.twindow.map?.fitBounds(bounds);
    }
  }, [searchThisAreaPois]);

  const bbAccommodationHotelOffersBoundMemo = useMemo(() => {
    if (bbAccommodationHotelOffers.length === 0) return null;
    const bounds: google.maps.LatLngBoundsLiteral = {
      east: 200,
      west: 200,
      north: 200,
      south: 200,
    };

    bbAccommodationHotelOffers.forEach((x) => {
      if (x.info.longitude && x.info.latitude) {
        bounds.west = bounds.west === 200 ? Number(x.info.longitude) : Math.min(bounds.east, Number(x.info.longitude));
        bounds.east = bounds.east === 200 ? Number(x.info.longitude) : Math.max(bounds.west, Number(x.info.longitude));

        bounds.south = bounds.south === 200 ? Number(x.info.latitude) : Math.min(bounds.south, Number(x.info.latitude));
        bounds.north = bounds.north === 200 ? Number(x.info.latitude) : Math.max(bounds.north, Number(x.info.latitude));
      }
    });

    return bounds;
  }, [bbAccommodationHotelOffers]);

  const providerPoisMemo = useMemo(() => {
    if (showAccommodations) {
      return bbAccommodationHotelOffers;
    }
    return [];
  }, [bbAccommodationHotelOffers, showAccommodations]);

  const carRentOffersBoundMemo = useMemo(() => {
    if (bbCarRentOffers.length === 0) return null;
    const bounds: google.maps.LatLngBoundsLiteral = {
      east: 200,
      west: 200,
      north: 200,
      south: 200,
    };
    bbCarRentOffers.forEach((x) => {
      if (x.longitude && x.latitude) {
        bounds.west = bounds.west === 200 ? x.longitude : Math.min(bounds.east, x.longitude);
        bounds.east = bounds.east === 200 ? x.longitude : Math.max(bounds.west, x.longitude);
        bounds.south = bounds.south === 200 ? x.latitude : Math.min(bounds.south, x.latitude);
        bounds.north = bounds.north === 200 ? x.latitude : Math.max(bounds.north, x.latitude);
      }
      return bounds;
    });

    return bounds;
  }, [bbCarRentOffers]);

  const rezdyToursBoundMemo = useMemo(() => {
    if (rezdyProducts.length === 0) return null;
    const bounds: google.maps.LatLngBoundsLiteral = {
      east: 200,
      west: 200,
      north: 200,
      south: 200,
    };
    rezdyProducts?.forEach((x) => {
      if (x.longitude && x.latitude) {
        bounds.west = bounds.west === 200 ? x.longitude : Math.min(bounds.east, x.longitude);
        bounds.east = bounds.east === 200 ? x.longitude : Math.max(bounds.west, x.longitude);
        bounds.south = bounds.south === 200 ? x.latitude : Math.min(bounds.south, x.latitude);
        bounds.north = bounds.north === 200 ? x.latitude : Math.max(bounds.north, x.latitude);
      }
      return bounds;
    });

    return bounds;
  }, [rezdyProducts]);

  const videreoVideosBoundMemo = useMemo(() => {
    if (videreoVideos.length === 0) return null;
    const bounds: google.maps.LatLngBoundsLiteral = {
      east: 200,
      west: 200,
      north: 200,
      south: 200,
    };
    videreoVideos?.forEach((x) => {
      if (x.lat && x.lng) {
        bounds.west = bounds.west === 200 ? x.lng : Math.min(bounds.east, x.lng);
        bounds.east = bounds.east === 200 ? x.lng : Math.max(bounds.west, x.lng);
        bounds.south = bounds.south === 200 ? x.lat : Math.min(bounds.south, x.lat);
        bounds.north = bounds.north === 200 ? x.lat : Math.max(bounds.north, x.lat);
      }
      return bounds;
    });

    return bounds;
  }, [videreoVideos]);

  const victoryEventsBoundMemo = useMemo(() => {
    if (victoryEvents.length === 0) return null;
    const bounds: google.maps.LatLngBoundsLiteral = {
      east: 200,
      west: 200,
      north: 200,
      south: 200,
    };
    victoryEvents?.forEach((x) => {
      if (x.venue.address.latitude && x.venue.address.longitude) {
        bounds.west = bounds.west === 200 ? x.venue.address.longitude : Math.min(bounds.east, x.venue.address.longitude);
        bounds.east = bounds.east === 200 ? x.venue.address.longitude : Math.max(bounds.west, x.venue.address.longitude);
        bounds.south = bounds.south === 200 ? x.venue.address.latitude : Math.min(bounds.south, x.venue.address.latitude);
        bounds.north = bounds.north === 200 ? x.venue.address.latitude : Math.max(bounds.north, x.venue.address.latitude);
      }
      return bounds;
    });

    return bounds;
  }, [victoryEvents]);

  const carRentOffersMemo = useMemo(() => {
    if (showCarRentOffers) {
      return bbCarRentOffers;
    }
    return [];
  }, [bbCarRentOffers, showCarRentOffers]);

  const providerToursMemo = useMemo(() => {
    if (showProviderTours) {
      return rezdyProducts;
    }
    return [];
  }, [rezdyProducts, showProviderTours]);

  const providerVideosMemo = useMemo(() => {
    if (showProviderVideos) {
      return videreoVideos;
    }
    return [];
  }, [videreoVideos, showProviderVideos]);

  const providerEventsMemo = useMemo(() => {
    if (showProviderEvents) {
      return victoryEvents;
    }
    return [];
  }, [victoryEvents, showProviderEvents]);

  useEffect(() => {
    if (stepsMemo.length <= 1) {
      dispatch(changeLegs([]));
    }
  }, [dispatch, stepsMemo.length]);

  const setLegsCallback = useCallback(
    (legs: any[]) => {
      dispatch(changeLegs(legs));
    },
    [dispatch]
  );

  const focusMarkerStepOrPoiId = useMemo(() => {
    if (focus.step) {
      return focus.step.id;
    }

    return focus.alternative?.poi.id || focus.poi?.id;
  }, [focus]);

  const focusMarkerProviderPoiCode = useMemo(() => {
    if (focus.providerPoi) {
      return focus.providerPoi.info.hotelCode;
    }

    return "";
  }, [focus]);

  const focusMarkerCarRentOfferLocationCode = useMemo(() => {
    if (focus.carRentOffer) {
      return focus.carRentOffer.locationCode;
    }

    return "";
  }, [focus]);

  const focusMarkerProviderTourLocationCode = useMemo(() => {
    if (focus.providerTour) {
      return { lat: focus.providerTour.latitude, long: focus.providerTour.longitude };
    }
  }, [focus]);

  const focusMarkerProviderVideoLocationCode = useMemo(() => {
    if (focus.providerVideo) {
      return { lat: focus.providerVideo.lat, long: focus.providerVideo.lng };
    }
  }, [focus]);

  // const focusMarkerProviderEventLocationCode = useMemo(() => {
  //   if (focus.providerEvent) {
  //     return { lat: focus.providerEvent.venue.address.latitude, long: focus.providerEvent.venue.address.longitude };
  //   }
  // }, [focus]);

  const gMap = useMemo(
    () => (
      <GoogleMaps
        /* gmapZoom={gmapZoom} gmapCenter={gmapCenter} */
        onZoomChanged={() => {
          dispatch(changedZoom(window.twindow.map?.getZoom()));
          dispatch(changedBoundry(window.twindow.map?.getBounds()));
        }}
        onCenterChanged={() => {
          dispatch(changedCenter(window.twindow.map?.getCenter()));
          dispatch(changedBoundry(window.twindow.map?.getBounds()));
        }}
        // focus data props
        steps={stepsMemo}
        alternativePois={alternativesMemo}
        searchPoi={focus.poi}
        searchAreaPois={searchThisAreaPois}
        cityBounds={cityBounds}
        // direction result legs
        setLegs={setLegsCallback}
        // poi info poi id by focus for marker animation
        focusMarkerStepOrPoiId={focusMarkerStepOrPoiId}
        focusMarkerProviderPoiCode={focusMarkerProviderPoiCode}
        focusMarkerCarRentLocationCode={focusMarkerCarRentOfferLocationCode}
        focusMarkerProviderTourLocationCode={focusMarkerProviderTourLocationCode}
        focusMarkerProviderVideoLocationCode={focusMarkerProviderVideoLocationCode}
        focusMarkerProviderEvent={focus.providerEvent}
        // lost focus for map empty click
        mapClicked={(coordinate: Model.Coordinate) => {
          focusLost();
          dispatch(handleMapClick(coordinate));
        }}
        // step poi marker click
        markerStepClicked={focusStep}
        // alternative poi marker click
        markerAlternativeClicked={focusPoi}
        markerSearchThisAreaClicked={focusPoi}
        providersPois={providerPoisMemo}
        carRentOffers={carRentOffersMemo}
        providerTours={providerToursMemo}
        providerVideos={providerVideosMemo}
        providerEvents={providerEventsMemo}
        markerProvidersPoiClicked={focusProviderPoi}
        markerCarRentOfferClicked={focusCarRentOffer}
        markerProviderTourClicked={focusProviderTour}
        markerProviderVideoClicked={focusProviderVideo}
        markerProviderEventClicked={focusProviderEvent}
        eventCardClicked={eventCardClicked}
        cycling={cycling}
        hideRoutes={hideRoutes}
      />
    ),
    [
      stepsMemo,
      alternativesMemo,
      focus.poi,
      focus.providerEvent,
      searchThisAreaPois,
      cityBounds,
      setLegsCallback,
      focusMarkerStepOrPoiId,
      focusMarkerProviderPoiCode,
      focusMarkerCarRentOfferLocationCode,
      focusMarkerProviderTourLocationCode,
      focusMarkerProviderVideoLocationCode,
      focusStep,
      focusPoi,
      providerPoisMemo,
      carRentOffersMemo,
      providerToursMemo,
      providerVideosMemo,
      providerEventsMemo,
      focusProviderPoi,
      focusCarRentOffer,
      focusProviderTour,
      focusProviderVideo,
      focusProviderEvent,
      eventCardClicked,
      cycling,
      hideRoutes,
      dispatch,
      focusLost,
    ]
  );

  useEffect(() => {
    if (showAccommodations && bbAccommodationHotelOffersBoundMemo) {
      const timer = setTimeout(() => {
        window.twindow.map?.fitBounds(bbAccommodationHotelOffersBoundMemo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAccommodations, bbAccommodationHotelOffersBoundMemo]);

  useEffect(() => {
    if (showCarRentOffers && carRentOffersBoundMemo) {
      const timer = setTimeout(() => {
        window.twindow.map?.fitBounds(carRentOffersBoundMemo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showCarRentOffers, carRentOffersBoundMemo]);

  useEffect(() => {
    if (showProviderTours && rezdyToursBoundMemo) {
      const timer = setTimeout(() => {
        window.twindow.map?.fitBounds(rezdyToursBoundMemo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProviderTours, rezdyToursBoundMemo]);

  useEffect(() => {
    if (showProviderVideos && videreoVideosBoundMemo) {
      const timer = setTimeout(() => {
        window.twindow.map?.fitBounds(videreoVideosBoundMemo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProviderVideos, videreoVideosBoundMemo]);

  useEffect(() => {
    if (showProviderEvents && victoryEventsBoundMemo) {
      const timer = setTimeout(() => {
        window.twindow.map?.fitBounds(victoryEventsBoundMemo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProviderEvents, victoryEventsBoundMemo]);

  return gMap;
};

export default GMap;
