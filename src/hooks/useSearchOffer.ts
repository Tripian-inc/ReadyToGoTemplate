import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/trip";
import useTrip from "./useTrip";
import useAuth from "./useAuth";

const useSearchOffer = () => {
  const { tripReference } = useTrip();
  const { isLoggedIn } = useAuth();

  const [loadingSearchOffers, setLoadingSearchOffers] = useState<boolean>(false);
  const [offersResult, setOffersResult] = useState<Model.Poi[]>([]);

  const dispatch = useDispatch();

  const searchOffer = useCallback(async () => {
    setOffersResult([]);
    setLoadingSearchOffers(true);
    if (tripReference && isLoggedIn) {
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
        .offerSearch(dateFrom, dateTo, tripianBounds.join(","))
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
  }, [isLoggedIn, tripReference]);

  const searchOfferCampaign = useCallback(
    async (campaignId: number) => {
      setOffersResult([]);
      setLoadingSearchOffers(true);

      return api
        .offerSearchCampaign(campaignId)
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
    [dispatch]
  );

  useEffect(() => {
    searchOffer();
  }, [searchOffer]);

  return { loadingSearchOffers, offersResult, searchOffer, searchOfferCampaign };
};

export default useSearchOffer;
