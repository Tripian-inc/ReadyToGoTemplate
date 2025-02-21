import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import ICombinedState from "../redux/model/ICombinedState";
import { saveNotification, changeLoadingOffers, changeOffers } from "../redux/action/trip";
import useAuth from "./useAuth";
import useTranslate from "./useTranslate";

const useMyOffers = () => {
  const [loadingMyOffers, setLoadingMyOffers] = useState<{ optIn: number[]; optOut: number[] }>({ optIn: [], optOut: [] });
  const { tripReference, myAllOffers, loadingMyAllOffers } = useSelector((state: ICombinedState) => ({
    tripReference: state.trip?.reference,
    myAllOffers: state.trip.offers,
    loadingMyAllOffers: state.trip.loading.offers,
  }));

  const { isLoggedIn } = useAuth();

  const dispatch = useDispatch();

  const { t } = useTranslate();

  const isLoadingOffer = useCallback(
    (offerId: number) => loadingMyOffers.optIn.includes(offerId) || loadingMyOffers.optOut.includes(offerId),
    [loadingMyOffers.optIn, loadingMyOffers.optOut]
  );

  // const loadingOfferIdList = useMemo(() => loadingMyOffers.optIn.concat(loadingMyOffers.optOut), [loadingMyOffers.optIn, loadingMyOffers.optOut]);

  const offersOptInFetch = useCallback(async (): Promise<Model.Poi[]> => {
    const arrivalDatetime = tripReference?.tripProfile?.arrivalDatetime;
    const departureDatetime = tripReference?.tripProfile?.departureDatetime;

    if (arrivalDatetime && departureDatetime && isLoggedIn) {
      const dateFrom = moment(arrivalDatetime).format("YYYY-MM-DD");
      const dateTo = moment(departureDatetime).format("YYYY-MM-DD");

      dispatch(changeLoadingOffers(true));

      try {
        const offers = await api.offersOptIn(dateFrom, dateTo);
        dispatch(changeOffers(offers));
        return offers;
      } catch (fetchOffersError: any) {
        dispatch(changeOffers([]));
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "fetchOffersError", fetchOffersError));
        return [];
      } finally {
        dispatch(changeLoadingOffers(false));
      }
    }

    // eslint-disable-next-line no-console
    console.warn("offersOptInFetch called without valid tripReference");
    return Promise.resolve([]);
  }, [tripReference, isLoggedIn, dispatch]);

  const offerOptIn = useCallback(
    async (offerId: number, optInDateTime: string): Promise<void> => {
      setLoadingMyOffers((prevLoading) => ({ ...prevLoading, optIn: [...prevLoading.optIn, offerId] }));

      await api
        .offerUpdateOptIn(offerId, optInDateTime)
        .then((deleteUpdateResponse: Model.DeleteUpdateResponse) => {
          if (deleteUpdateResponse.updated === true) {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.SUCCESS, "offerOptIn", t("trips.myTrips.itinerary.offers.myOffers.success.succesfullyMade")));
            return offersOptInFetch().then((userOffers: Model.Poi[]) => {
              return userOffers;
            });
          } else {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "offerOptIn", t("trips.myTrips.itinerary.offers.myOffers.error.optInCouldntMade")));
          }
        })
        .catch((optInOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "offerOptIn", optInOfferError));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, offersOptInFetch]
  );

  const offerOptOut = useCallback(
    async (offerId: number): Promise<void> => {
      setLoadingMyOffers((prevLoading) => ({ ...prevLoading, optOut: [...prevLoading.optOut, offerId] }));

      await api
        .offerDelete(offerId)
        .then((deleteUpdateResponse: Model.DeleteUpdateResponse) => {
          return offersOptInFetch().then((userOffers: Model.Poi[]) => {
            return userOffers;
          });
        })
        .catch((optOutOfferError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "offerOptOut", optOutOfferError));
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
    [dispatch, offersOptInFetch]
  );

  useEffect(() => {
    if (
      myAllOffers === undefined &&
      loadingMyAllOffers === false &&
      tripReference?.tripProfile.arrivalDatetime !== undefined &&
      tripReference?.tripProfile.departureDatetime !== undefined
    )
      offersOptInFetch();
  }, [loadingMyAllOffers, myAllOffers, offersOptInFetch, tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime]);

  return { loadingMyAllOffers, myAllOffers, offerOptIn, offerOptOut, isLoadingOffer };
};

export default useMyOffers;
