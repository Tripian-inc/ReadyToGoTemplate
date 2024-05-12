import { useCallback, useEffect, useState } from "react";
import moment from "moment";
// import { useDispatch } from "react-redux";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
// import { saveNotification } from "../redux/action/user";

const useProviderPois = (tripReference?: Model.TripReference) => {
  const [loadingProviderPois, setLoadingProviderPois] = useState<boolean>(false);
  /* const [providerPois, setProviderPois] = useState<{ id: string; name: string; coordinate: Model.Coordinate; content: React.ReactElement }[]>([]); */
  const [bbAccommodationHotelOffers, setBbAccommodationHotelOffers] = useState<Providers.Bb.SearchAccommodationHotelOffer[]>([]);

  /* const dispatch = useDispatch(); */

  const fetchProviderPois = useCallback(
    (bounds: number[]) => {
      if (window.tconfig.SHOW_ACCOMMODATION_POIS) {
        if (window.tconfig.ACCOMMODATION_PROVIDER_ID === Model.PROVIDER_ID.BOOK_BARBADOS) {
          if (tripReference?.tripProfile.arrivalDatetime && tripReference?.tripProfile.departureDatetime && tripReference?.tripProfile.numberOfAdults) {
            const lastTripDatetime = moment(tripReference.tripProfile.departureDatetime).format("X");
            const datetimeNow = moment(new Date()).format("X");
            if (datetimeNow <= lastTripDatetime) {
              setLoadingProviderPois(true);
              setBbAccommodationHotelOffers([]);

              const checkIn = moment(tripReference.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
              const checkOutDefault = moment(tripReference.tripProfile.departureDatetime).format("YYYY-MM-DD");

              const checkOut = checkIn === checkOutDefault ? moment(tripReference.tripProfile.departureDatetime).add("day", 1).format("YYYY-MM-DD") : checkOutDefault;

              try {
                providers.bb
                  ?.searchAccommodation(checkIn || "", checkOut || "", tripReference.tripProfile.numberOfAdults, bounds)
                  .then((searchAccommodationResponse: Providers.Bb.SearchAccommodationResponse) => {
                    try {
                      // TODO
                      // TEMP
                      if (searchAccommodationResponse?.hotelOffers !== undefined) setBbAccommodationHotelOffers(searchAccommodationResponse.hotelOffers);

                      /*  const pps: { id: string; name: string; coordinate: Model.Coordinate; content: React.ReactElement }[] = searchAccommodationResponse.hotelOffers.map((x) => ({
                    id: x.info.hotelCode,
                    name: x.info.name,
                    coordinate: { lat: Number(x.info.latitude), lng: Number(x.info.longitude) },
                    content: React.createElement(
                      "div",
                      {
                        
                      },
                      x.info.name
                    ),
                  }));
  
                  setProviderPois(pps); */
                    } catch {}
                  })
                  .catch((bbFetchAccommodationError) => {
                    // dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "BBFetchAccommodation", "Book Barbados Fetch Accommodation", bbFetchAccommodationError));
                  })
                  .finally(() => {
                    setLoadingProviderPois(false);
                  });
              } catch {}
            }
          }
        }
      }
    },
    [tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime, tripReference?.tripProfile.numberOfAdults]
  );

  useEffect(() => {
    if (tripReference?.city.boundary)
      fetchProviderPois([tripReference.city.boundary[1], tripReference.city.boundary[3], tripReference.city.boundary[0], tripReference.city.boundary[2]]);
  }, [fetchProviderPois, tripReference?.city.boundary]);

  return { loadingProviderPois, /* providerPois, */ /* fetchProviderPois, */ bbAccommodationHotelOffers };
};

export default useProviderPois;
