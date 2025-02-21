import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/trip";
import useTrip from "./useTrip";
import { useParams } from "react-router";

const useSearchOffer = () => {
  const { tripReference } = useTrip();

  const [loadingSearchOffers, setLoadingSearchOffers] = useState<boolean>(false);
  const [offersResult, setOffersResult] = useState<Model.Poi[]>([]);

  const dispatch = useDispatch();

  const { hashParam } = useParams<{ hashParam: string }>();

  const shared = useMemo(() => {
    if (hashParam) {
      const params = hashParam.split("!");
      return params.length > 1 && hashParam.split("!")[1] === "s";
    }
    return false;
  }, [hashParam]);

  const searchOffer = useCallback(async () => {
    setOffersResult([]);
    setLoadingSearchOffers(true);
    if (tripReference?.tripProfile.arrivalDatetime && tripReference.tripProfile.departureDatetime && tripReference.city) {
      const dateFrom = moment(tripReference.tripProfile.arrivalDatetime).format("YYYY-MM-DD"); //  2023-06-01
      const dateTo = moment(tripReference.tripProfile.departureDatetime).format("YYYY-MM-DD"); //  2023-07-01

      /* const bounds = window.twindow.map?.getBounds();
      const ne = bounds?.getNorthEast();
      const sw = bounds?.getSouthWest();
      const tripianBounds = [sw?.lat() || 0, ne?.lat() || 0, sw?.lng() || 0, ne?.lng() || 0]; */

      let parentLocationCity: number[] | undefined = undefined;
      if (0 < tripReference.city.parentLocations.length && tripReference.city.parentLocations[0].locationType === Model.LOCATION_TYPE.CITY) {
        parentLocationCity = tripReference.city.parentLocations[0].boundary;
      }
      const tripianBounds = parentLocationCity ?? tripReference.city.boundary;

      return api
        .offerSearch(dateFrom, dateTo, tripianBounds.join(","), true)
        .then((pois) => {
          setOffersResult(pois);
          return pois;
        })
        .catch((searchOfferError) => {
          // dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "searchOffer", "Search Offers", searchOfferError));
          throw searchOfferError;
        })
        .finally(() => {
          setLoadingSearchOffers(false);
        });
    }

    setLoadingSearchOffers(false);
    return [];
  }, [tripReference?.city, tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime]);

  const searchOfferCampaign = useCallback(
    async (campaignId: number) => {
      setOffersResult([]);
      setLoadingSearchOffers(true);

      return api
        .offerSearchCampaign(campaignId, !shared)
        .then((pois) => {
          setOffersResult(pois);
          return pois;
        })
        .catch((searchOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "searchOfferCampaign", "Search Campaign Offers", searchOfferError));
          throw searchOfferError;
        })
        .finally(() => {
          setLoadingSearchOffers(false);
        });
    },
    [dispatch, shared]
  );

  const myOfferCampaign = useCallback(
    async (campaignId: number) => {
      setOffersResult([]);
      setLoadingSearchOffers(true);

      return api
        .myCampaignOffers(campaignId)
        .then((pois) => {
          return pois;
        })
        .catch((searchOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "searchOfferCampaign", "Search Campaign Offers", searchOfferError));
          throw searchOfferError;
        })
        .finally(() => {
          setLoadingSearchOffers(false);
        });
    },
    [dispatch]
  );

  useEffect(() => {
    searchOffer();
  }, [searchOffer]);

  return { loadingSearchOffers, offersResult, searchOffer, searchOfferCampaign, myOfferCampaign };
};

export default useSearchOffer;
