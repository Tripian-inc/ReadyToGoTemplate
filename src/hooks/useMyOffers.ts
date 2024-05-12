import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import ICombinedState from "../redux/model/ICombinedState";
import { saveNotification, changeLoadingOffers, changeOffers } from "../redux/action/trip";

const useMyOffers = () => {
  const [loadingMyOffers, setLoadingMyOffers] = useState<{ optIn: number[]; optOut: number[] }>({ optIn: [], optOut: [] });
  const { tripReference, myAllOffers, loadingMyAllOffers, readOnlyTrip } = useSelector((state: ICombinedState) => ({
    tripReference: state.trip?.reference,
    myAllOffers: state.trip.offers,
    loadingMyAllOffers: state.trip.loading.offers,
    readOnlyTrip: state.trip.readOnly,
  }));
  const dispatch = useDispatch();

  const isLoadingOffer = useCallback(
    (offerId: number) => loadingMyOffers.optIn.includes(offerId) || loadingMyOffers.optOut.includes(offerId),
    [loadingMyOffers.optIn, loadingMyOffers.optOut]
  );

  // const loadingOfferIdList = useMemo(() => loadingMyOffers.optIn.concat(loadingMyOffers.optOut), [loadingMyOffers.optIn, loadingMyOffers.optOut]);

  const offersFetch = useCallback(async (): Promise<Model.Offer[]> => {
    if (tripReference?.tripProfile.arrivalDatetime && tripReference?.tripProfile.departureDatetime && readOnlyTrip === false) {
      const dateFrom = moment(tripReference.tripProfile.arrivalDatetime).format("YYYY-MM-DD"); //  2023-06-01
      const dateTo = moment(tripReference.tripProfile.departureDatetime).format("YYYY-MM-DD"); //  2023-07-01

      dispatch(changeLoadingOffers(true));

      return api
        .offers(dateFrom, dateTo)
        .then((offers) => {
          dispatch(changeOffers(offers));
          return offers;
        })
        .catch((fetchOffersError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "fetchOffersError", "Fetch Offers", fetchOffersError));

          return fetchOffersError;
        })
        .finally(() => {
          dispatch(changeLoadingOffers(false));
        });
    }

    // eslint-disable-next-line no-console
    console.warn("fetchOffers called with undefined tripReference");
    return Promise.resolve([]);
  }, [dispatch, tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime, readOnlyTrip]);

  const offerOptIn = useCallback(
    async (offerId: number, optInDate: string): Promise<void> => {
      setLoadingMyOffers((prevLoading) => ({ ...prevLoading, optIn: [...prevLoading.optIn, offerId] }));

      await api
        .offerUpdateOptIn(offerId, optInDate)
        .then((deleteUpdateResponse: Model.DeleteUpdateResponse) => {
          // console.log(deleteUpdateResponse.updated);
          return offersFetch().then((userOffers: Model.Offer[]) => {
            // console.log(123);
            return userOffers;
          });
        })
        .catch((optInOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "offerOptIn", "Opt In Offer", optInOfferError));
          // throw optInOfferError;
        })
        .finally(() => {
          setLoadingMyOffers((prevLoading) => {
            const newState = { ...prevLoading, optIn: [...prevLoading.optIn] };
            const index = newState.optIn.indexOf(offerId);
            if (index > -1) newState.optIn.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, offersFetch]
  );

  const offerOptOut = useCallback(
    async (offerId: number): Promise<void> => {
      setLoadingMyOffers((prevLoading) => ({ ...prevLoading, optOut: [...prevLoading.optOut, offerId] }));

      await api
        .offerDelete(offerId)
        .then((deleteUpdateResponse: Model.DeleteUpdateResponse) => {
          console.log(deleteUpdateResponse.updated);
          return offersFetch().then((userOffers: Model.Offer[]) => {
            // console.log(456);
            return userOffers;
          });
        })
        .catch((optOutOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "offerOptOut", "Opt Out Offer", optOutOfferError));
          // throw optOutOfferError;
        })
        .finally(() => {
          setLoadingMyOffers((prevLoading) => {
            const newState = { ...prevLoading, optOut: [...prevLoading.optOut] };
            const index = newState.optOut.indexOf(offerId);
            if (index > -1) newState.optOut.splice(index, 1);
            return newState;
          });
        });
    },
    [dispatch, offersFetch]
  );

  useEffect(() => {
    if (
      myAllOffers === undefined &&
      loadingMyAllOffers === false &&
      tripReference?.tripProfile.arrivalDatetime !== undefined &&
      tripReference?.tripProfile.departureDatetime !== undefined
    )
      offersFetch();
  }, [loadingMyAllOffers, myAllOffers, offersFetch, tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime]);

  return { loadingMyAllOffers, myAllOffers, offerOptIn, offerOptOut, isLoadingOffer };
};

export default useMyOffers;
