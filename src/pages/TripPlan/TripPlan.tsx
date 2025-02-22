import React, { useEffect, useState, useMemo /*, useCallback*/ } from "react";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { CloseIconButton2, Modal, PageLoading, TabMenu /*, CloseIconButton, RefCard, Modal, PreLoading, ReservationDetails, Button, BookingDetails */ } from "@tripian/react";
import { providers } from "@tripian/core";
import Model from "@tripian/model";
import ICombinedState from "../../redux/model/ICombinedState";
import { changeTripListVisible } from "../../redux/action/layout";
import { TRIP_PLAN, OVERVIEW, UPDATE_TRIP, TOUR_INFO /* , LANDING */, MY_BOOKINGS_PAGE, LOCAL_EXPERIENCES } from "../../constants/ROUTER_PATH_TITLE";
import MapLayout from "./layouts/Map/MapLayout";
import Menu from "./layouts/Menu/Menu";
import PlanContainer from "./layouts/Container/PlanContiner/PlanContainer";
import FocusContainer from "./layouts/Container/FocusContainer/FocusContainer";
import SearchContainer from "./layouts/Container/SearchContainer/SearchContainer";
import FavoritesContainer from "./layouts/Container/FavoritesContainer/FavoritesContainer";
import { googleAnalyticsDimension } from "../../gtag";
import useAuth from "../../hooks/useAuth";
import useTrip from "../../hooks/useTrip";
import usePlan from "../../hooks/usePlan";
import useAlternative from "../../hooks/useAlternative";
import usePoiCategory from "../../hooks/usePoiCategory";
import useFocus from "../../hooks/useFocus";
import useLayoutPlan from "./hooks/useLayoutPlan";
import AppNav from "../../App/AppNav/AppNav";
import TripAppMenu from "../../App/AppNav/TripMenu/TripAppMenu";
// import useReservation from "../../hooks/useReservation";
import { saveNotification } from "../../redux/action/trip";
import { useGygApi } from "../../hooks/useGygApi";
import useUser from "../../hooks/useUser";
import useTranslate from "../../hooks/useTranslate";
import MyOffersContainer from "./layouts/Container/MyOffersContainer/MyOffersContainer";
import SearchOffersContainer from "./layouts/Container/SearchOffersContainer/SearchOffersContainer";
import useSearchOffer from "../../hooks/useSearchOffer";
import useTripHashParams from "../../hooks/useTripHashParams";
import useMyOffers from "../../hooks/useMyOffers";
import useBbTours from "../../hooks/useBbTours";
import useViatorCatalog from "../../hooks/useViatorCatalog";
import useToristyCatalog from "../../hooks/useToristyCatalog";
import { LoginModal } from "../../components/LoginModal/LoginModal";
import classes from "./TripPlan.module.scss";

const mapClasses = ["map-container"];
const TripPlanPage = () => {
  const {
    // tripLoading,
    showPlanList,
    // showFocusInfo,
    // searchVisible,
    // favoritesVisible,

    // focus,
  } = useSelector((state: ICombinedState) => ({
    // tripLoading: state.trip.loading.reference,
    showPlanList: state.layout.tripListVisible,
    // showFocusInfo: state.layout.focusInfoVisible,
    // searchVisible: state.layout.searchVisible,
    // favoritesVisible: state.layout.favoritesVisible,

    // focus: state.gmap.focus,
  }));
  const { loadingIsLoggedIn } = useAuth();
  const { loadingTripReferences } = useUser();
  const { loadingTripReference, tripReadOnly } = useTrip();

  const { plans, planFetch, loadingPlan, loadingPlans } = usePlan();
  const { alternatives, alternativesFetch } = useAlternative();
  // const { yelpReservations, gygReservations, viatorReservations, reservationCancel, loadingReservation, initReservations } = useReservation();
  const { poiCategoryGroups, loadingPoiCategories } = usePoiCategory();
  const [selectedPoiCategoryIds, setSelectedPoiCategoryIds] = useState<number[]>([]);

  const { focusLost, focus } = useFocus();
  const { loadingSearchOffers, offersResult, searchOffer } = useSearchOffer();
  const { isLoadingOffer, myAllOffers, offerOptIn, offerOptOut, loadingMyAllOffers } = useMyOffers();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const {
    explorePlacesVisible,
    setExplorePlacesVisible,
    favoritesVisible,
    setFavoritesVisible,
    offersMyVisible,
    setOffersMyVisible,
    offersSearchVisible,
    setOffersSearchVisible,
    // yourBookingsVisible,
    // setYourBookingsVisible,
    // setLocalExperiencesVisible,
    setShowTourInfoModal,
  } = useLayoutPlan();

  const { t } = useTranslate();

  const history = useHistory();
  const dispatch = useDispatch();

  const { hashParam, dayIndex } = useParams<{ hashParam: string; dayIndex: string }>();
  const dayIndexNumber = isNaN(+dayIndex) ? 0 : +dayIndex;
  const { hash, tripReference } = useTripHashParams(hashParam);

  const { gygToursCatalog, gygLoaders } = useGygApi(
    tripReference?.city.id,
    tripReference?.city.name,
    tripReference?.tripProfile.arrivalDatetime,
    tripReference?.tripProfile.departureDatetime,
    tripReference?.tripProfile.numberOfAdults,
    tripReference?.tripProfile.numberOfChildren
  );

  const { viatorToursCatalog, loadingViatorTourCatalog } = useViatorCatalog(
    tripReference?.city.name,
    tripReference?.tripProfile.arrivalDatetime,
    tripReference?.tripProfile.departureDatetime
  );

  const { toristyToursCatalog, loadingToristyTourCatalog } = useToristyCatalog(tripReference?.city.id);

  const { bbToursCatalog, loadingBbTourCatalog } = useBbTours(tripReference?.city.id, tripReference?.tripProfile.arrivalDatetime, tripReference?.tripProfile.departureDatetime);

  // const poiCategoryGroups = useMemo(() => helper.getCategoryGroups(poiCategories), [poiCategories]);

  document.title = `${TRIP_PLAN.TITLE(t("tripPlan.header"))} - ${tripReference?.city.name || ""} - ${hash}`;

  const toursLoading = window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(
    Model.PROVIDER_ID.VIATOR || Model.PROVIDER_ID.GYG || Model.PROVIDER_ID.BOOK_BARBADOS || Model.PROVIDER_ID.TORISTY
  )
    ? loadingBbTourCatalog || gygLoaders.tourCatalogLoader || loadingViatorTourCatalog || loadingToristyTourCatalog
    : false;

  const sharedTrip = useMemo(() => {
    const params = hashParam.split("!");
    return params.length > 1 && hashParam.split("!")[1] === "s";
  }, [hashParam]);
  /* */
  /* */
  /* ******* USE STATES ******* */
  /* */

  // Alternative step Id
  const [alternativesStepId, setAlternativesStepId] = useState<number | undefined>(undefined);

  //The index props for selecting the clicked explore more category
  const [selectedPoiCategoryGroups, setSelectedPoiCategoryGroups] = useState<Model.PoiCategoryGroup[]>([]);
  // Yelp
  // const [yelpReservationDetailsModalState, setYelpReservationDetailsModalState] = useState<{
  //   show: boolean;
  //   reservationDetails?: Providers.Yelp.ReservationInfo;
  // }>({
  //   show: false,
  // });

  /* useEffect(() => {
    if (user === undefined) history.replace(LANDING.PATH);
  }, [history, user]); */
  // useEffect(() => {
  //   initReservations();
  // }, [initReservations]);

  /* */
  /* */
  /* ******* GYG RESERVATION DETAILS ******* */
  // const [gygReservationDetailsModalState, setGygReservationDetailsModalState] = useState<{
  //   show: boolean;
  //   reservationDetails?: Providers.Gyg.TourReservationDetails;
  // }>({
  //   show: false,
  // });
  /* */
  /* */
  /* ******* Viator RESERVATION DETAILS ******* */
  // const [viatorReservationDetailsModalState, setViatorReservationDetailsModalState] = useState<{
  //   show: boolean;
  //   reservationDetails?: Providers.Viator.BookingReservationDetails;
  // }>({
  //   show: false,
  // });
  /* ******* YELP RESERVATION DETAILS ******* */
  /* */
  /* */

  /* */
  /* ******* USE STATES ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* USE EFFECTS ******* */
  /* */

  useEffect(() => {
    if (tripReference?.city.name) {
      console.debug("googleAnalyticsDimension", tripReference?.city.name);
      googleAnalyticsDimension("displayedTripCityName", tripReference?.city.name);
    }
  }, [tripReference?.city.name]);

  // Clear
  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      focusLost();
      // dispatch(changeFavoritesVisible(false));
      // dispatch(changeSearchVisible(false));
    };
  }, [dispatch, focusLost]);

  useEffect(() => {
    if (tripReference?.tripProfile.doNotGenerate === 1) {
      history.replace(`${UPDATE_TRIP.PATH}/${hashParam}`);
    }
  }, [hashParam, history, tripReference?.tripProfile.doNotGenerate, loadingIsLoggedIn]);

  // Trip Plans
  useEffect(() => {
    if (plans && plans[dayIndexNumber].generatedStatus === 0 && tripReadOnly === false) {
      planFetch(plans[dayIndexNumber].id);
    }
    setAlternativesStepId(undefined);
  }, [tripReadOnly, dayIndexNumber, planFetch, plans]);

  // Alternatives
  useEffect(() => {
    if (plans) {
      alternativesFetch(dayIndexNumber);
    }
  }, [alternativesFetch, dayIndexNumber, plans]);

  // Alternative Step Id
  useEffect(() => {
    setAlternativesStepId(undefined);
  }, [dayIndexNumber]);

  // GoogleMaps clear last route rendered bounds
  useEffect(() => {
    window.twindow.cityBounds = undefined;
    window.twindow.planBounds = undefined;
  }, []);

  /* */
  /* ******* USE EFFECTS ******* */
  /* */
  /* */

  /*
  // gyg reservation cancel
  const memoizedBookingCancel = useCallback(
    (providerReservationId: string) => {
      if (providers.gyg === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with undefined api.yelp object");
        return Promise.resolve();
      }

      if (gygReservations === undefined || tripReference?.city === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with undefined reservation");
        return Promise.resolve();
      }

      const currentReservation = gygReservations?.find(
        (reservation) => (reservation.value as Providers.Gyg.TourReservationDetails).data.shopping_cart.shopping_cart_hash === providerReservationId
      );

      if (currentReservation === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with unknown providerReservationId: ", providerReservationId);
        return Promise.resolve();
      }

      return reservationCancel(providerReservationId)?.then(() => {
        setGygReservationDetailsModalState({ show: false });
      });
    },
    [gygReservations, reservationCancel, tripReference?.city]
  );
*/

  /* */
  /* */
  /* ******* TOUR INFO ******* */
  /* */

  // const tourInfoModal = useMemo(
  //   () => (
  //     <TourInfoModal
  //       gygClose={() => {
  //         setShowTourInfoModal(false);
  //       }}
  //       bbClose={() => {
  //         setShowTourInfoModal(false);
  //       }}
  //       /* fetchBbTourInfo={(offerKey) => {
  //         fetchTourInfo(offerKey, false);
  //       }} */
  //       gygTourState={gygTourInfo}
  //       bbTourState={{ product: selectedBbProduct, activityInfo: bbActivityInfo }}
  //       tourInfoShowLoading={{ show: showTourInfoModal, loading: gygLoaders.tourInfoLoader || false }}
  //       tripCurrentDate={plans?.[dayIndexNumber].date || ""}
  //       tripReference={tripReference}
  //       adultCount={adultCount}
  //       childrenCount={childrenCount}
  //       gygTourOptionDetails={gygTourOptionDetails}
  //       gygBookingInfo={gygBookingInfo}
  //       gygPaymentClick={confirmPayment}
  //       gygLoaders={gygLoaders}
  //       gygBookingClick={gygTourBooking}
  //       fetchGygTourOptionsWithDetails={(date: string, adult: number, tourId: number, children?: number | undefined) =>
  //         fetchTourOptionsWithDetails(tourId, date, date, adult, children)
  //       }
  //       user={user}
  //     />
  //   ),
  //   [
  //     gygTourInfo,
  //     selectedBbProduct,
  //     bbActivityInfo,
  //     showTourInfoModal,
  //     gygLoaders,
  //     plans,
  //     dayIndexNumber,
  //     tripReference,
  //     adultCount,
  //     childrenCount,
  //     gygTourOptionDetails,
  //     gygBookingInfo,
  //     confirmPayment,
  //     gygTourBooking,
  //     user,
  //     setShowTourInfoModal,
  //     /* fetchTourInfo, */
  //     fetchTourOptionsWithDetails,
  //   ]
  // );
  /* */
  /* ******* TOUR INFO ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* YELP RESERVATION DETAILS ******* */
  /* */
  // const memoizedYelpReservationDetailsModal = useMemo(
  //   () => (
  //     <Modal
  //       show={yelpReservationDetailsModalState.show}
  //       className={`${classes.bookingModal} p5`}
  //       backdropClick={() => {
  //         if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
  //       }}
  //     >
  //       <div className="row mb0">
  //         <div className={`${classes.tripPlannerModalCloseIcon} m2`}>
  //           <CloseIconButton
  //             fill="#fff"
  //             clicked={() => {
  //               if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
  //             }}
  //           />
  //         </div>
  //         {yelpReservationDetailsModalState.reservationDetails ? (
  //           <div>
  //             {loadingReservation ? (
  //               <div className={classes.createUpdateTripLoading}>
  //                 <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
  //               </div>
  //             ) : null}
  //             <div>
  //               <ReservationDetails reservationInfo={yelpReservationDetailsModalState.reservationDetails} />
  //             </div>
  //             <div className="row center">
  //               <div>
  //                 <Button
  //                   color="primary"
  //                   text="Cancel Reservation"
  //                   onClick={() => {
  //                     setYelpReservationDetailsModalState((prevState) => ({
  //                       ...prevState,
  //                     }));
  //                     reservationCancel(yelpReservationDetailsModalState.reservationDetails?.reservation_id || "")?.then(() => {
  //                       setYelpReservationDetailsModalState({ show: false });
  //                     });
  //                   }}
  //                 />
  //               </div>
  //             </div>
  //           </div>
  //         ) : null}
  //       </div>
  //     </Modal>
  //   ),
  //   [yelpReservationDetailsModalState.show, yelpReservationDetailsModalState.reservationDetails, loadingReservation, reservationCancel]
  // );
  /* */
  /* ******* YELP RESERVATION DETAILS ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* Gyg RESERVATION DETAILS MODAL***** */
  // const gygReservationDetailsModal = useMemo(
  //   () => (
  //     <Modal
  //       show={gygReservationDetailsModalState.show}
  //       className="booking-modal p5"
  //       backdropClick={() => {
  //         if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
  //       }}
  //     >
  //       <div className="row m0">
  //         <div className="travel-guide-modal-close-icon m2">
  //           <CloseIconButton
  //             fill="#fff"
  //             clicked={() => {
  //               if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
  //             }}
  //           />
  //         </div>
  //         {gygReservationDetailsModalState.reservationDetails ? (
  //           <div>
  //             {loadingReservation ? (
  //               <div className={classes.createUpdateTripLoading}>
  //                 <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
  //               </div>
  //             ) : null}
  //             <div>
  //               <BookingDetails bookingInfo={gygReservationDetailsModalState.reservationDetails} />
  //             </div>
  //             <div className={classes.bookingReservationCancelText}>
  //               <div>Manage ticket through email confirmation from provider or click link above.</div>
  //             </div>
  //             {/* <div className="row center">
  //               <div>
  //                 <Button
  //                   color="primary"
  //                   text="Cancel Reservation"
  //                   onClick={() => {
  //                     setGygReservationDetailsModalState((prevState) => ({
  //                       ...prevState,
  //                     }));
  //                     memoizedBookingCancel(gygReservationDetailsModalState.reservationDetails?.data.shopping_cart.shopping_cart_hash || "");
  //                   }}
  //                 />
  //               </div>
  //             </div> */}
  //           </div>
  //         ) : null}
  //       </div>
  //     </Modal>
  //   ),
  //   [gygReservationDetailsModalState.show, gygReservationDetailsModalState.reservationDetails, loadingReservation /*, memoizedBookingCancel*/]
  // );

  /* ******* GYG RESERVATION DETAILS MODAL***** */
  /* */
  /* */

  /* */
  /* */
  /* ******* Viator RESERVATION DETAILS MODAL***** */
  // const viatorReservationDetailsModal = useMemo(
  //   () => (
  //     <Modal
  //       show={viatorReservationDetailsModalState.show}
  //       className="booking-modal p5"
  //       backdropClick={() => {
  //         if (!loadingReservation) setViatorReservationDetailsModalState({ show: false });
  //       }}
  //     >
  //       <div className="row m0">
  //         <div className={`${classes.tripPlannerModalCloseIcon} m2`}>
  //           <CloseIconButton
  //             fill="#fff"
  //             clicked={() => {
  //               if (!loadingReservation) setViatorReservationDetailsModalState({ show: false });
  //             }}
  //           />
  //         </div>
  //         {viatorReservationDetailsModalState.reservationDetails ? (
  //           <div>
  //             {loadingReservation ? (
  //               <div className={classes.createUpdateTripLoading}>
  //                 <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
  //               </div>
  //             ) : null}
  //             <div>
  //               <BookingInfo bookingInfo={viatorReservationDetailsModalState.reservationDetails} t={t} />
  //             </div>
  //             <div className="row center">
  //               <div>
  //                 <Button
  //                   color="primary"
  //                   text="Cancel Reservation"
  //                   onClick={() => {
  //                     setViatorReservationDetailsModalState((prevState) => ({
  //                       ...prevState,
  //                     }));
  //                     reservationCancel(viatorReservationDetailsModalState.reservationDetails?.items[0].bookingRef || "")?.then(() => {
  //                       setViatorReservationDetailsModalState({ show: false });
  //                     });
  //                   }}
  //                 />
  //               </div>
  //             </div>
  //           </div>
  //         ) : null}
  //       </div>
  //     </Modal>
  //   ),
  //   [viatorReservationDetailsModalState.show, viatorReservationDetailsModalState.reservationDetails, loadingReservation, t, reservationCancel]
  // );
  /* ******* Viator RESERVATION DETAILS MODAL***** */
  /* */
  /* */

  /* */
  /* */
  /* ******* YOUR BOOKINGS MODAL ******* */
  /* */

  // const yourBookingsModal = useMemo(() => {
  //   const closeYourBookingsModal = () => {
  //     setYourBookingsVisible(false);
  //   };

  //   const filteredUserReservations: Model.UserReservation[] = yelpReservations || [];

  //   return (
  //     <Modal className={`${classes.tasteInfoModal} scrollable-y`} show={yourBookingsVisible} backdropClick={closeYourBookingsModal}>
  //       <div className={`row mb0 ${classes.bookingPopUp}`}>
  //         <div className="col col12 m5 p0 mb0">
  //           <div className={`${classes.tripPlannerModalCloseIcon} m2`}>
  //             <CloseIconButton fill="#fff" clicked={closeYourBookingsModal} />
  //           </div>
  //           <h3 className="center ">{t("trips.myTrips.itinerary.bookings.header")}</h3>
  //           {filteredUserReservations.length === 0 && gygReservations?.length === 0 && viatorReservations?.length === 0 ? (
  //             <div className="center mt8">
  //               <span>{t("trips.myTrips.itinerary.bookings.emptyMessage")}</span>
  //             </div>
  //           ) : (
  //             <>
  //               {filteredUserReservations.map((yelpReservation) => {
  //                 const yelpReservationInfo = yelpReservation.value as Providers.Yelp.ReservationInfo;
  //                 return (
  //                   <div key={yelpReservationInfo.reservation_id} className="pt4">
  //                     <RefCard
  //                       image={yelpReservationInfo.restaurant_image}
  //                       title={yelpReservationInfo.restaurant_name}
  //                       butonText="VIEW RESERVATION"
  //                       subContext={`Covers : ${yelpReservationInfo.reservation_details.covers === 1 ? "1 person" : `${yelpReservationInfo.reservation_details.covers} people`}`}
  //                       clicked={() => {
  //                         setYelpReservationDetailsModalState({ show: true, reservationDetails: yelpReservationInfo });
  //                       }}
  //                     >
  //                       Date: {`${yelpReservationInfo.reservation_details.date}`}
  //                       <br />
  //                       Time : {` ${yelpReservationInfo.reservation_details.time}`}
  //                     </RefCard>
  //                   </div>
  //                 );
  //               })}
  //               {gygReservations?.map((gygReservation) => {
  //                 const gygReservationInfo = gygReservation.value as Providers.Gyg.TourReservationDetails;
  //                 const formattedImg = helper.getYourGuideImageFormat(gygReservationInfo.data.shopping_cart.tour_image, "60");
  //                 return (
  //                   <div key={gygReservationInfo.data.shopping_cart.shopping_cart_hash} className="pt4">
  //                     <RefCard
  //                       image={formattedImg}
  //                       title={gygReservationInfo.data.shopping_cart.tour_name}
  //                       butonText="VIEW TOUR BOOKING"
  //                       subContext={`Travelers : ${
  //                         gygReservationInfo.data.shopping_cart.bookings.length === 1 ? "1 person" : `${gygReservationInfo.data.shopping_cart.bookings.length} people`
  //                       }`}
  //                       clicked={() => {
  //                         setGygReservationDetailsModalState({ show: true, reservationDetails: gygReservationInfo });
  //                       }}
  //                     >
  //                       Date: {`${moment(gygReservationInfo.data.shopping_cart.bookings[0].bookable.datetime).format("MMM DD - HH:mm")}`}
  //                     </RefCard>
  //                   </div>
  //                 );
  //               })}

  //               {viatorReservations?.map((viatorReservation) => {
  //                 const viatorReservationInfo = viatorReservation.value as Providers.Viator.BookingReservationDetails;
  //                 const numberOfTravelers = viatorReservationInfo?.items[0].lineItems[0].numberOfTravelers;
  //                 return (
  //                   <div key={viatorReservationInfo.cartRef} className="pt4">
  //                     <RefCard
  //                       image={viatorReservationInfo.tourImage}
  //                       title={viatorReservationInfo.tourName}
  //                       butonText="VIEW TOUR BOOKING"
  //                       subContext={`Travelers : ${numberOfTravelers === 1 ? "1 person" : `${numberOfTravelers} people`}`}
  //                       clicked={() => {
  //                         setViatorReservationDetailsModalState({ show: true, reservationDetails: viatorReservationInfo });
  //                       }}
  //                     >
  //                       Date: {`${moment().format("MMM DD - HH:mm")}`}
  //                     </RefCard>
  //                   </div>
  //                 );
  //               })}
  //             </>
  //           )}
  //         </div>
  //       </div>
  //     </Modal>
  //   );
  // }, [yelpReservations, viatorReservations, gygReservations, yourBookingsVisible, t, setYourBookingsVisible]);
  /* */
  /* ******* YOUR BOOKINGS MODAL ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* LOCAL EXPERIENCES MODAL ******* */
  /* */
  // const localExperiencesModal = useMemo(
  //   () => (
  //     <LocalExperiences
  //       show={localExperiencesVisible}
  //       close={() => {
  //         setLocalExperiencesVisible(false);
  //       }}
  //       gygToursCatalog={gygToursCatalog}
  //       bbToursCatalog={bbToursCatalog}
  //       viatorProductCatalog={viatorProductCatalogGroup}
  //       tourCardClicked={(productId: string) => {
  //         // setShowTourInfoModal(true);
  //         // fetchTourInfo(productId).then((success: boolean) => {
  //         //   if (success === false) setShowTourInfoModal(false);
  //         // });
  //       }}
  //       gygtourCardClicked={(productId: string) => {
  //         const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
  //         const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");
  //         history.push(
  //           `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.GYG}/${productId}?start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}&children=${tripReference?.tripProfile.numberOfChildren}`
  //         );
  //         // setShowTourInfoModal(true);
  //         // fetchGygTourInfo(productId).then((success: boolean) => {
  //         //   if (success === false) setShowTourInfoModal(false);
  //         // });
  //       }}
  //       /** TODO: */
  //       bbTourCardClicked={(product: Providers.Bb.Product) => {
  //         if (product.offers.length === 0) {
  //           dispatch(
  //             saveNotification(Model.NOTIFICATION_TYPE.ERROR, "Book Barbados Fetch", "Book Barbados Fetch Tour Error", "There are not available offers in the trip date range.")
  //           );
  //         }

  //         const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
  //         const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");

  //         history.push(
  //           `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.BOOK_BARBADOS}/${product.info.id}?start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}&children=${tripReference?.tripProfile.numberOfChildren}`
  //         );
  //       }}
  //       viatorTourCardClicked={(productCode: string) => {
  //         const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
  //         const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");
  //         history.push(
  //           `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VIATOR}/${productCode}?start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}&children=${tripReference?.tripProfile.numberOfChildren}`
  //         );
  //       }}
  //       tourCardSliderLoading={loadingBbTourCatalog || gygLoaders.tourCatalogLoader || loadingViatorProductCatalog}
  //     />
  //   ),
  //   [
  //     localExperiencesVisible,
  //     gygToursCatalog,
  //     bbToursCatalog,
  //     viatorProductCatalogGroup,
  //     loadingBbTourCatalog,
  //     gygLoaders.tourCatalogLoader,
  //     loadingViatorProductCatalog,
  //     setLocalExperiencesVisible,
  //     tripReference?.tripProfile.arrivalDatetime,
  //     tripReference?.tripProfile.departureDatetime,
  //     tripReference?.tripProfile.numberOfAdults,
  //     tripReference?.tripProfile.numberOfChildren,
  //     history,
  //     dispatch,
  //   ]
  // );
  /* */
  /* ******* LOCAL EXPERIENCES MODAL ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* RENDER ******* */
  /* */
  // class name
  if (!showPlanList) mapClasses.push("w-m-100");

  // Ordered modal
  // const orderedModals = () => {
  //   const oneModal = () => {
  //     if (yelpReservationDetailsModalState.show) return memoizedYelpReservationDetailsModal;
  //     if (gygReservationDetailsModalState.show) return gygReservationDetailsModal;
  //     if (viatorReservationDetailsModalState.show) return viatorReservationDetailsModal;
  //     if (yourBookingsVisible) return yourBookingsModal;
  //     // if (showTourInfoModal) return tourInfoModal;
  //     return null;
  //   };

  //   return (
  //     <>
  //       {/* {localExperiencesVisible ? localExperiencesModal : null} */}
  //       {oneModal()}
  //     </>
  //   );
  // };

  // console.log("offersSearchVisible", offersSearchVisible);

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

  const showLocalExperiences = () => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TRAVELIFY) && providers.travelify && tripReference) {
      providers.travelify
        .getTourTicketUrl(
          tripReference.tripProfile.arrivalDatetime,
          tripReference.tripProfile.departureDatetime,
          tripReference.city.coordinate.lat,
          tripReference.city.coordinate.lng,
          10
        )
        .then((url) => {
          window.open(url);
        });
    } else {
      const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
      const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");

      history.push(
        `${LOCAL_EXPERIENCES.PATH}?city_id=${tripReference?.city.id}&city_name=${tripReference?.city.name}&lat=${tripReference?.city.coordinate.lat}&lng=${tripReference?.city.coordinate.lng}&start_date=${startDate}&end_date=${endDate}&adult=${tripReference?.tripProfile.numberOfAdults}&children=${tripReference?.tripProfile.numberOfChildren}`,
        {
          customState: `${TRIP_PLAN.PATH}/${hashParam}`,
        }
      );
    }
  };

  const videreoModal = useMemo(() => {
    if (focus.providerVideo) {
      return (
        <Modal
          className="!w-[90%] !max-w-[100vw] bg-background-color md:!w-[70%] md:!max-w-[70vw] max-h-[90vh] overflow-auto"
          show={!!focus.providerVideo}
          backdropClick={() => {
            focusLost();
          }}
          zIndex={499}
        >
          <div className="p-4">
            <div>
              <CloseIconButton2
                fill="#2B2B33"
                clicked={() => {
                  focusLost();
                }}
                rounded
              />
            </div>

            <div>
              <div className="flex items-center justify-center font-bold text-xl mr-1">{focus.providerVideo?.name}</div>

              <div className="mt-4">
                <video
                  controls
                  autoPlay
                  muted
                  className="w-full h-auto max-h-[70vh] object-contain"
                  src={`https://stream.mux.com/${focus.providerVideo.mux_playbackid}/capped-1080p.mp4`}
                />
              </div>
            </div>
          </div>
        </Modal>
      );
    }
  }, [focus.providerVideo, focusLost]);

  return (
    <>
      <AppNav
        tripInfoHeader={false}
        tripAppMenu={
          <TripAppMenu
            onClickBookings={() => {
              // setYourBookingsVisible(true);
              history.push(MY_BOOKINGS_PAGE.PATH);
            }}
            onClickOffers={() => {
              setOffersMyVisible(true);
            }}
            onClickFavorites={() => {
              focusLost();
              setFavoritesVisible(true);
            }}
            sharedTrip={sharedTrip}
            t={t}
          />
        }
        sharedTrip={sharedTrip}
      />

      {loadingTripReferences || loadingTripReference || loadingPlans || loadingPlan || loadingPoiCategories ? <PageLoading /> : null}

      {window.tconfig.SHOW_OVERVIEW && (
        <div className={`col ${classes.tripTabMenu}`}>
          <TabMenu
            menuItems={[
              {
                title: "OVERVIEW",
                onClick: () => {
                  history.push(`${OVERVIEW.PATH}/${hash}`);
                },
              },
              {
                title: t("trips.myTrips.title"),
                onClick: () => {},
              },
            ]}
            selectedIndex={1}
          />
        </div>
      )}

      {tripReference && (
        <MapLayout
          tripReference={tripReference}
          planDayIndex={dayIndexNumber}
          fullWidth={!showPlanList}
          alternativesStepId={alternativesStepId}
          poiCategoryGroups={poiCategoryGroups}
          offersSearchVisible={offersSearchVisible}
          setOffersSearchVisible={setOffersSearchVisible}
          loadingSearchOffers={loadingSearchOffers}
          offersResult={offersResult}
          searchOffer={searchOffer}
          sharedTrip={sharedTrip}
          selectedPoiCategoryIds={selectedPoiCategoryIds}
          setSelectedPoiCategoryIds={setSelectedPoiCategoryIds}
          eventCardClicked={(eventid: number) => history.push(`${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VICTORY}/${eventid}`)}
          t={t}
        />
      )}

      {
        <PlanContainer
          planDayIndex={dayIndexNumber}
          changePlanDayIndex={(newDayIndexNumber: number) => {
            history.push(`${TRIP_PLAN.PATH}/${hashParam}/${newDayIndexNumber}`);
          }}
          show={showPlanList}
          alternativesStepId={alternativesStepId}
          setAlternativesStepId={setAlternativesStepId}
          showExplorePlaces={() => {
            setExplorePlacesVisible(true);
          }}
          showLocalExperiences={() => showLocalExperiences()}
          selectedPoiCategoryGroup={(poiCategoryGroup: Model.PoiCategoryGroup) => {
            setSelectedPoiCategoryGroups([poiCategoryGroup]);
          }}
          selectedPoiCategoryIds={selectedPoiCategoryIds}
          poiCategoryGroups={poiCategoryGroups}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          toursLoading={toursLoading}
        />
      }

      {tripReference && plans ? (
        <SearchContainer
          show={explorePlacesVisible}
          close={() => setExplorePlacesVisible(false)}
          // poiCategories={poiCategories}
          dayIndex={dayIndexNumber}
          tripHash={tripReference.tripHash}
          tripReadOnly={tripReadOnly}
          plans={plans}
          alternatives={alternatives || []}
          selectedPoiCategoryGroups={selectedPoiCategoryGroups}
          setSelectedPoiCategoryGroups={(selectedPoiCategoryGroups: Model.PoiCategoryGroup[]) => {
            const newSelectedPoiCategoryGroups = [...selectedPoiCategoryGroups];
            newSelectedPoiCategoryGroups.concat(selectedPoiCategoryGroups);
            setSelectedPoiCategoryGroups(newSelectedPoiCategoryGroups);
          }}
          poiCategoryGroups={poiCategoryGroups}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          toursLoading={toursLoading}
          t={t}
        />
      ) : null}

      {
        <SearchOffersContainer
          show={offersSearchVisible}
          close={() => {
            setOffersSearchVisible(false);
          }}
          dayIndex={dayIndexNumber}
          plans={plans}
          loadingSearchOffers={loadingSearchOffers}
          offersResult={offersResult}
          isLoadingOffer={isLoadingOffer}
          offerOptIn={offerOptIn}
          offerOptOut={offerOptOut}
          myAllOffers={myAllOffers}
          timezone={tripReference?.city.timezone}
          setShowLoginModal={(show) => setShowLoginModal(show)}
        />
      }

      {
        <MyOffersContainer
          show={offersMyVisible}
          close={() => {
            setOffersMyVisible(false);
          }}
          dayIndex={dayIndexNumber}
          plans={plans}
          loadingMyAllOffers={loadingMyAllOffers}
          myAllOffers={myAllOffers}
          isLoadingOffer={isLoadingOffer}
          offerOptIn={offerOptIn}
          offerOptOut={offerOptOut}
          timezone={tripReference?.city.timezone}
        />
      }

      {
        <FavoritesContainer
          show={favoritesVisible}
          close={() => {
            setFavoritesVisible(false);
          }}
          dayIndex={dayIndexNumber}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          toursLoading={toursLoading}
        />
      }

      {plans && (
        <FocusContainer
          planId={plans[dayIndexNumber].id}
          showTourInfoModal={(productId: string) => {
            setShowTourInfoModal(true);

            // temp only bb
            // if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS)) {
            //   const bbProduct = bbToursCatalog.reduce((p: Providers.Bb.Product[], c) => [...p, ...c.items], []).find((tour) => tour.info.id.toString() === productId);

            //   if (bbProduct) {
            //     setSelectedBbProduct(bbProduct);

            //     const currentDateTour = bbProduct.offers.find((pr) => pr.date === moment(plans?.[dayIndexNumber].date || "").format("YYYY-MM-DD"));

            //     if (currentDateTour) {
            //       fetchTourInfo(currentDateTour?.offerKey).then((success: boolean) => {
            //         if (success === false) setShowTourInfoModal(false);
            //       });
            //     } else {
            //       fetchTourInfo(bbProduct.offers[0].offerKey).then((success: boolean) => {
            //         if (success === false) setShowTourInfoModal(false);
            //       });
            //     }
            //   } else {
            //     setSelectedBbProduct(undefined);
            //   }
            // }

            // temp only gyg
            if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
              if (gygToursCatalog) {
                if (gygTourIds.includes(Number(productId))) {
                  const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
                  const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");
                  history.push(
                    `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.GYG}/${productId}?city_id=${tripReference?.city.id}&city_name=${
                      tripReference?.city.name
                    }&start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}${
                      tripReference?.tripProfile.numberOfChildren ? `&children=${tripReference?.tripProfile.numberOfChildren}` : ""
                    }`
                  );
                }
                /* else {
                  dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Gyg Tour Ticket Info", t("trips.toursAndTickets.error.notAvailable"), 1000));
                  setShowTourInfoModal(false);
                } */
              } else {
                dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Gyg Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
                setShowTourInfoModal(false);
              }
              // fetchGygTourInfo(productId).then((success: boolean) => {
              //   if (success === false) setShowTourInfoModal(false);
              // });
            }

            // temp only bb
            if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS)) {
              if (bbToursCatalog) {
                if (bbTourIds.includes(Number(productId))) {
                  const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
                  const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");
                  history.push(
                    `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.BOOK_BARBADOS}/${productId}?city_id=${tripReference?.city.id}&city_name=${
                      tripReference?.city.name
                    }&start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}${
                      tripReference?.tripProfile.numberOfChildren ? `&children=${tripReference?.tripProfile.numberOfChildren}` : ""
                    }`
                  );
                }
                /*else{
        
                  dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Bookbarbados Tour Ticket Info", t("trips.toursAndTickets.error.notAvailable"), 1000));
                  setShowTourInfoModal(false);
                }*/
              } else {
                dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Bookbarbados Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
                setShowTourInfoModal(false);
              }
            }

            // temp only Viator
            if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VIATOR)) {
              if (viatorToursCatalog) {
                if (viatorTourIds.includes(productId)) {
                  const startDate = moment(tripReference?.tripProfile.arrivalDatetime).format("YYYY-MM-DD");
                  const endDate = moment(tripReference?.tripProfile.departureDatetime).format("YYYY-MM-DD");
                  history.push(
                    `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VIATOR}/${productId}?city_id=${tripReference?.city.id}&city_name=${
                      tripReference?.city.name
                    }&start_date=${startDate}&end_date=${endDate}&adults=${tripReference?.tripProfile.numberOfAdults}${
                      tripReference?.tripProfile.numberOfChildren ? `&children=${tripReference?.tripProfile.numberOfChildren}` : ""
                    }`
                  );
                }
                /* else {
                  dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.notAvailable"), 1000));
                  setShowTourInfoModal(false);
                } */
              } else {
                dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
                setShowTourInfoModal(false);
              }
            }

            // temp only Toristy
            if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TORISTY)) {
              if (toristyToursCatalog) {
                if (toristyTourIds.includes(productId)) {
                  history.push(`${TOUR_INFO.PATH}/${Model.PROVIDER_ID.TORISTY}/${productId}`);
                }
                /* else {
                              dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.notAvailable"), 1000));
                              setShowTourInfoModal(false);
                            } */
              } else {
                dispatch(saveNotification(Model.NOTIFICATION_TYPE.WARNING, "Viator Tour Ticket Info", t("trips.toursAndTickets.error.stillFetching"), 1000));
                setShowTourInfoModal(false);
              }
            }
          }}
          isLoadingOffer={isLoadingOffer}
          myAllOffers={myAllOffers}
          offerOptIn={offerOptIn}
          offerOptOut={offerOptOut}
          hideActionButtons={sharedTrip && window.tconfig.WIDGET_THEME_1}
          hideFavoriteIcon={sharedTrip && window.tconfig.WIDGET_THEME_1}
          hideScore={sharedTrip && window.tconfig.WIDGET_THEME_1}
          hidePartOfDay={sharedTrip && window.tconfig.WIDGET_THEME_1}
          hideFeatures={sharedTrip && window.tconfig.WIDGET_THEME_1}
          hideCuisine={sharedTrip && window.tconfig.WIDGET_THEME_1}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          toursLoading={toursLoading}
        />
      )}

      <Menu
        listShown={showPlanList}
        sharedTrip={sharedTrip}
        showList={() => {
          dispatch(changeTripListVisible(!showPlanList));
        }}
        showExplorePlaces={() => {
          setExplorePlacesVisible(true);
        }}
        showFavorites={() => {
          focusLost();
          setFavoritesVisible(true);
        }}
        showOffers={() => setOffersMyVisible(true)}
        showLocalExperiences={() => showLocalExperiences()}
      />

      {/* {orderedModals()} */}

      {videreoModal}

      {showLoginModal && <LoginModal sharedTripHash={tripReference?.tripHash ?? ""} onCancel={() => setShowLoginModal(false)} />}
    </>
  );
};

export default TripPlanPage;
