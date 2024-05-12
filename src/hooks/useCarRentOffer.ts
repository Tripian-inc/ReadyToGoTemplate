import { useCallback, useEffect, useState } from "react";
import moment from "moment";
// import { useDispatch } from "react-redux";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
// import { saveNotification } from "../redux/action/user";

const useCarRentOffer = (tripReference?: Model.TripReference) => {
  const [loadingCarRentOffers, setLoadingCarRentOffers] = useState<boolean>(false);
  const [bbCarRentOffers, setBbCarRentOffers] = useState<Providers.Bb.SearchCarRentOffer[]>([]);

  /* const dispatch = useDispatch(); */

  const fetchCarRentOffers = useCallback(
    (bounds: number[]) => {
      if (window.tconfig.SHOW_ACCOMMODATION_POIS) {
        if (window.tconfig.ACCOMMODATION_PROVIDER_ID === Model.PROVIDER_ID.BOOK_BARBADOS) {
          if (tripReference) {
            setLoadingCarRentOffers(true);
            setBbCarRentOffers([]);
            const pickUpDateTime = moment(tripReference.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
            const dropOffDateTimeDefault = moment(tripReference.tripProfile.departureDatetime).format("YYYY-MM-DD");
            const dropOffDateTime =
              pickUpDateTime === dropOffDateTimeDefault ? moment(tripReference.tripProfile.departureDatetime).add("day", 1).format("YYYY-MM-DD") : dropOffDateTimeDefault;

            providers.bb
              ?.searchCarRent(pickUpDateTime || "", dropOffDateTime || "")
              .then((searchCarRentOfferResponse: Providers.Bb.SearchCarRentOffer[]) => {
                try {
                  if (searchCarRentOfferResponse !== undefined && Array.isArray(searchCarRentOfferResponse)) setBbCarRentOffers(searchCarRentOfferResponse);
                } catch (error) {}
              })
              .catch((bbFetchAccommodationError) => {
                // dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "BBFetchAccommodation", "Book Barbados Fetch Accommodation", bbFetchAccommodationError));
              })
              .finally(() => {
                setLoadingCarRentOffers(false);
              });
          }
        }
      }
    },
    [tripReference]
  );

  useEffect(() => {
    if (tripReference) fetchCarRentOffers([tripReference.city.boundary[1], tripReference.city.boundary[3], tripReference.city.boundary[0], tripReference.city.boundary[2]]);
  }, [fetchCarRentOffers, tripReference]);

  return { loadingCarRentOffers, /* providerPois, */ /* fetchProviderPois, */ bbCarRentOffers };
};

export default useCarRentOffer;
