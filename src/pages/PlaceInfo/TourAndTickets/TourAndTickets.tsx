import React, { useCallback, useMemo } from "react";
import { useGygApi } from "../../../hooks/useGygApi";
import useViatorCatalog from "../../../hooks/useViatorCatalog";
import useToristyCatalog from "../../../hooks/useToristyCatalog";
import useBbTours from "../../../hooks/useBbTours";
import TourTicketCard from "./../TourTiketCard/TourTicketCard";
import { PreLoading } from "@tripian/react";
import useCities from "../../../hooks/useCities";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import moment from "moment";
import Model from "@tripian/model";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import { saveNotification } from "../../../redux/action/user";

const TourAndTickets = ({ poiInfo, t }) => {
  const history = useHistory();

  const dispatch = useDispatch();

  const { cities } = useCities();

  const city = useMemo(() => cities?.find((city) => city.id === poiInfo?.cityId), [cities, poiInfo?.cityId]);

  const arrivalDate = useMemo(() => moment().startOf("day").format("YYYY-MM-DD"), []);
  const departureDate = useMemo(() => moment(arrivalDate).add(1, "days").format("YYYY-MM-DD"), [arrivalDate]);

  const { gygToursCatalog, gygLoaders } = useGygApi(city?.id, city?.name, arrivalDate, departureDate, 1);
  const { viatorToursCatalog, loadingViatorTourCatalog } = useViatorCatalog(city?.name, arrivalDate, departureDate);
  const { toristyToursCatalog, loadingToristyTourCatalog } = useToristyCatalog(city?.id);
  const { bbToursCatalog, loadingBbTourCatalog } = useBbTours(city?.id, arrivalDate, departureDate);

  const toursLoading = useMemo(() => {
    return gygLoaders.tourCatalogLoader || loadingViatorTourCatalog || loadingToristyTourCatalog || loadingBbTourCatalog;
  }, [gygLoaders.tourCatalogLoader, loadingViatorTourCatalog, loadingToristyTourCatalog, loadingBbTourCatalog]);

  const gygTourIds = useMemo<number[]>(() => {
    if (!gygToursCatalog) {
      return [];
    }

    return gygToursCatalog.reduce<number[]>((prev, cur) => {
      return [...prev, ...cur.items.map((item) => item.tour_id)];
    }, []);
  }, [gygToursCatalog]);

  const viatorTourIds = useMemo<string[]>(() => {
    if (!viatorToursCatalog) {
      return [];
    }

    return viatorToursCatalog.reduce<string[]>((prev, cur) => {
      return [...prev, ...cur.items.map((item) => item.productCode)];
    }, []);
  }, [viatorToursCatalog]);

  const toristyTourIds = useMemo<string[]>(() => {
    if (!toristyToursCatalog) {
      return [];
    }

    return toristyToursCatalog.reduce<string[]>((prev, cur) => {
      return [...prev, ...cur.items.map((item) => item.id)];
    }, []);
  }, [toristyToursCatalog]);

  const bbTourIds = useMemo<number[]>(() => {
    if (!bbToursCatalog) {
      return [];
    }

    return bbToursCatalog.reduce<number[]>((prev, cur) => {
      return [...prev, ...cur.items.map((item) => item.info.id)];
    }, []);
  }, [bbToursCatalog]);

  const tourProducts = useCallback(
    (poi: Model.Poi) => {
      const tourProviderBookings = poi.bookings.filter((booking: Model.Booking) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(booking.providerId));

      let applicableTourProducts: Model.BookingProduct[] = [];

      tourProviderBookings.forEach((booking) => {
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS) && booking.providerId === Model.PROVIDER_ID.BOOK_BARBADOS) {
          // Bookbarbados
          const bbProducts = booking.products
            .filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => bbTourIds.includes(Number(product.id)))
            .map((product) => ({ ...product, provider: "Bookbarbados" }));

          applicableTourProducts = [...applicableTourProducts, ...bbProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VIATOR) && booking.providerId === Model.PROVIDER_ID.VIATOR) {
          // Viator
          const viatorProducts = booking.products
            .filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => viatorTourIds.includes(product.id.toString()))
            .map((product) => ({ ...product, provider: "Viator" }));

          applicableTourProducts = [...applicableTourProducts, ...viatorProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG) && booking.providerId === Model.PROVIDER_ID.GYG) {
          // Gyg
          const gygProducts = booking.products
            .filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => gygTourIds.includes(Number(product.id)))
            .map((product) => ({ ...product, provider: "GetYourGuide" }));

          applicableTourProducts = [...applicableTourProducts, ...gygProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GOCITY) && booking.providerId === Model.PROVIDER_ID.GOCITY) {
          // GoCity
          const goCityProducts = booking.products
            .filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .map((product) => ({ ...product, provider: "GoCity" }));

          applicableTourProducts = [...applicableTourProducts, ...goCityProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TORISTY) && booking.providerId === Model.PROVIDER_ID.TORISTY) {
          // Toristy
          const toristyProducts = booking.products
            .filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => toristyTourIds.includes(product.id.toString()))
            .map((product) => ({ ...product, provider: "Toristy" }));

          applicableTourProducts = [...applicableTourProducts, ...toristyProducts];
        }
      });

      return applicableTourProducts;
    },
    [bbTourIds, gygTourIds, toristyTourIds, viatorTourIds]
  );

  const ticketProducts = useCallback(
    (poi: Model.Poi) => {
      const ticketProviderBookings = poi.bookings.filter((booking: Model.Booking) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(booking.providerId));

      let applicableTicketProducts: Model.BookingProduct[] = [];

      ticketProviderBookings.forEach((booking) => {
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS) && booking.providerId === Model.PROVIDER_ID.BOOK_BARBADOS) {
          // Bookbarbados
          const bbTicketProducts = booking.products
            .filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => bbTourIds.includes(Number(product.id)))
            .map((product) => ({ ...product, provider: "Bookbarbados" }));
          applicableTicketProducts = [...applicableTicketProducts, ...bbTicketProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VIATOR) && booking.providerId === Model.PROVIDER_ID.VIATOR) {
          // Viator
          const viatorTicketProducts = booking.products
            .filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => viatorTourIds.includes(product.id.toString()))
            .map((product) => ({ ...product, provider: "Viator" }));
          applicableTicketProducts = [...applicableTicketProducts, ...viatorTicketProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG) && booking.providerId === Model.PROVIDER_ID.GYG) {
          // Gyg
          const gygTicketProducts = booking.products
            .filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => gygTourIds.includes(Number(product.id)))
            .map((product) => ({ ...product, provider: "GetYourGuide" }))
            .reverse();
          applicableTicketProducts = [...applicableTicketProducts, ...gygTicketProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GOCITY) && booking.providerId === Model.PROVIDER_ID.GOCITY) {
          // GoCity
          const goCityTicketProducts = booking.products
            .filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .map((product) => ({ ...product, provider: "GoCity" }));
          applicableTicketProducts = [...applicableTicketProducts, ...goCityTicketProducts];
        }
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TORISTY) && booking.providerId === Model.PROVIDER_ID.TORISTY) {
          // Toristy
          const toristyCityTicketProducts = booking.products
            .filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET))
            .filter((product) => toristyTourIds.includes(product.id.toString()))
            .map((product) => ({ ...product, provider: "Toristy" }));
          applicableTicketProducts = [...applicableTicketProducts, ...toristyCityTicketProducts];
        }
      });
      return applicableTicketProducts;
    },
    [bbTourIds, gygTourIds, toristyTourIds, viatorTourIds]
  );

  const productOnClick = (productId: string) => {
    const product = poiInfo?.bookings.find((b) => b.products.some((p) => p.id.toString() === productId));

    // temp only GoCity

    if (product?.providerId === Model.PROVIDER_ID.GOCITY) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GOCITY)) {
        const productUrl = product.products.find((p) => p.id.toString() === productId)?.url;
        window.open(productUrl || "https://gocity.com");
        return;
      }
    }

    // temp only gyg
    if (product?.providerId === Model.PROVIDER_ID.GYG) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
        if (gygToursCatalog) {
          if (gygTourIds.includes(Number(productId))) {
            history.push(
              `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.GYG}/${productId}?city_id=${city?.id}&city_name=${city?.name}&start_date=${arrivalDate}&end_date=${departureDate}&adults=1`
            );
          }
        } else {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Gyg Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
        }
      }
    }

    // temp only bb
    if (product?.providerId === Model.PROVIDER_ID.BOOK_BARBADOS) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS)) {
        if (bbToursCatalog) {
          if (bbTourIds.includes(Number(productId))) {
            history.push(
              `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.BOOK_BARBADOS}/${productId}?city_id=${city?.id}&city_name=${city?.name}&start_date=${arrivalDate}&end_date=${departureDate}&adults=1`
            );
          }
        } else {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Bookbarbados Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
        }
      }
    }

    // temp only Viator
    if (product?.providerId === Model.PROVIDER_ID.VIATOR) {
      console.log("Viator1");
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VIATOR)) {
        console.log("Viator2");

        if (viatorToursCatalog) {
          console.log("Viator3");

          if (viatorTourIds.includes(productId)) {
            console.log("Viator4");

            history.push(
              `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VIATOR}/${productId}?city_id=${city?.id}&city_name=${city?.name}&start_date=${arrivalDate}&end_date=${departureDate}&adults=1`
            );
          }
        } else {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
        }
      }
    }

    // temp only Toristy

    if (product?.providerId === Model.PROVIDER_ID.TORISTY) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TORISTY)) {
        if (toristyToursCatalog) {
          if (toristyTourIds.includes(productId)) {
            history.push(`${TOUR_INFO.PATH}/${Model.PROVIDER_ID.TORISTY}/${productId}`);
          }
        } else {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
        }
      }
    }
  };

  return (
    <>
      {/* Buy Tickets */}
      {window.tconfig.SHOW_TOURS_AND_TICKETS && poiInfo && ticketProducts(poiInfo).length > 0 ? (
        <div className="mb-12">
          {toursLoading ? (
            <div>
              <PreLoading />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Buy Tickets</h2>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <div className="flex gap-6" style={{ width: "max-content" }}>
                  {ticketProducts(poiInfo).map((bookingProduct) => (
                    <div key={bookingProduct.id} className="pt4">
                      <TourTicketCard bookingProduct={bookingProduct} clicked={productOnClick} t={t} />
                    </div>
                  ))}
                  {/* </div> */}
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Join Local Tours */}
      {window.tconfig.SHOW_TOURS_AND_TICKETS && tourProducts(poiInfo).length > 0 ? (
        <div>
          {toursLoading && ticketProducts(poiInfo).length === 0 ? (
            <div>
              <PreLoading />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Local Tours</h2>
              <p className="text-gray-600 mb-6">Covering Mercat de la Boqueria</p>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <div className="flex gap-6" style={{ width: "max-content" }}>
                  {tourProducts(poiInfo).map((bookingProduct) => (
                    <div key={bookingProduct.id} className="pt4">
                      <TourTicketCard bookingProduct={bookingProduct} clicked={productOnClick} t={t} />
                    </div>
                  ))}
                  {/* </div> */}
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

export default TourAndTickets;
