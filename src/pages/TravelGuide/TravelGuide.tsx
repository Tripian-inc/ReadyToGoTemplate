import { api, providers } from "@tripian/core";
import Model, { helper, Providers } from "@tripian/model";
import {
  BookingDetails,
  ButterflyCard,
  ButterflyCardSlider,
  Button,
  CardSlider,
  CloseIconButton,
  GygTourCard,
  GygTourInfoEx,
  ImgLazy,
  Modal,
  PoiInfoImage,
  PoiInfoText,
  PoiOfferRefCard,
  PoiRefCard,
  PreLoading,
  RefCard,
  ReservationDetails,
  TabMenu,
  TasteCard2,
  TasteInfo,
  TourRefCardProduct,
} from "@tripian/react";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router";
import AppNav from "../../App/AppNav/AppNav";
import TripAppMenu from "../../App/AppNav/TripMenu/TripAppMenu";
import { TRAVEL_GUIDE, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import useFavorite from "../../hooks/useFavorite";
import useOffers from "../../hooks/useMyOffers";
import { useGygApi } from "../../hooks/useGygApi";
import usePlan from "../../hooks/usePlan";
import useReaction from "../../hooks/useReaction";
import useReservation from "../../hooks/useReservation";
import useSearchPoi from "../../hooks/useSearchPoi";
import useBbTours from "../../hooks/useBbTours";
import useTrip from "../../hooks/useTrip";
import IFavoritePoi from "../../models/IFavoritePoi";
import { saveNotification } from "../../redux/action/trip";
import useLayoutPlan from "../TripPlan/hooks/useLayoutPlan";
import useTranslate from "../../hooks/useTranslate";
import classes from "./TravelGuide.module.scss";

const TravelGuidePage = () => {
  const { tripReference, tripClear, tripFetch, tripReadOnly } = useTrip();
  const { cityId, favorites, loadingFavorites, favoriteAdd, favoriteDelete, loadingFavoritePoi, favoritesFetch } = useFavorite();
  const { loadingMyAllOffers, myAllOffers } = useOffers();
  const { plans, planFetch } = usePlan();
  const { reactions, reactionAdd, reactionDelete, loadingReactionStepList } = useReaction();
  const { fetchTourInfo, loadingBbTourInfo, loadingBbTourCatalog } = useBbTours();
  const { gygToursCatalog, fetchGygTourInfo, gygTourInfo } = useGygApi();
  const { yelpReservations, loadingReservation, gygReservations, reservationCancel, initReservations } = useReservation();
  const { tastePois, loadingTastePois, tastePoisFetch } = useSearchPoi();
  const { favoritesVisible, offersMyVisible, setFavoritesVisible, setOffersMyVisible, yourBookingsVisible, setYourBookingsVisible, showTourInfoModal, setShowTourInfoModal } =
    useLayoutPlan();

  const currentPlanDate = useMemo(() => (plans ? plans[0].date : undefined), [plans]);

  const { t } = useTranslate();

  useEffect(() => {
    initReservations();
  }, [initReservations]);

  useEffect(() => {
    if (favorites === undefined && loadingFavorites === false && cityId !== undefined) favoritesFetch();
  }, [cityId, favorites, favoritesFetch, loadingFavorites]);

  /* */
  /* */
  /* ******* TOP TEN ******* */
  const [topTenPois, setTopTenPois] = useState<Model.Poi[] | undefined>(undefined);
  /* ******* TOP TEN ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* POI INFO (TOP TEN - OUR PICKS FOR YOU) ******* */
  const [poiInfoModalState, setPoiInfoModalState] = useState<{ show: boolean; poiInfo?: Model.Poi }>({ show: false });
  /* ******* POI INFO (TOP TEN - OUR PICKS FOR YOU)******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* MUSTY-TRY FOODS ******* */
  const [tasteInfoModalState, setTasteInfoModalState] = useState<{ show: boolean; taste?: Model.TasteItem }>({ show: false });
  /* ******* MUSTY-TRY FOODS ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* YELP RESERVATION DETAILS ******* */
  const [yelpReservationDetailsModalState, setYelpReservationDetailsModalState] = useState<{
    show: boolean;
    reservationDetails?: Providers.Yelp.ReservationInfo;
  }>({
    show: false,
  });
  /* ******* YELP RESERVATION DETAILS ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* GYG RESERVATION DETAILS ******* */
  const [gygReservationDetailsModalState, setGygReservationDetailsModalState] = useState<{
    show: boolean;
    reservationDetails?: Providers.Gyg.TourReservationDetails;
  }>({
    show: false,
  });
  /* ******* YELP RESERVATION DETAILS ******* */
  /* */
  /* */

  const { hash } = useParams<{ hash: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  document.title = TRAVEL_GUIDE.TITLE();

  // common
  useEffect(() => {
    if (hash !== tripReference?.tripHash) {
      tripClear();
      tripFetch(hash);
    }
  }, [hash, tripClear, tripFetch, tripReference]);

  // plans
  const [planWaiting, setPlanWaiting] = useState<boolean>(false);
  useEffect(() => {
    if (plans) {
      const nextPlan = plans.find((p) => p.generatedStatus === 0);
      if (nextPlan && planWaiting === false) {
        // console.log('request yoktu attım.');
        setPlanWaiting(true);
        planFetch(nextPlan.id).finally(() => {
          setPlanWaiting(false);
        });
      }
      // console.log('request var atmadım. Ya da next plan yok. Eto bitmiş.');
    }
  }, [planFetch, planWaiting, plans]);

  // top ten, local tours
  useEffect(() => {
    if (tripReference) {
      api
        .topTen(tripReference.city.id)
        .then((topTenData) => {
          if (topTenData.length > 0) setTopTenPois(topTenData[0].topTenPoi);
          else setTopTenPois([]);
        })
        .catch((poisError) => {
          setTopTenPois([]);
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "fetchTopTenPois", "Get top ten pois", poisError));
        });
    }
  }, [dispatch, tripReference]);

  // yelp reservation cancel
  const memoizedReservationCancel = useCallback(
    (providerReservationId: string) => {
      if (providers.yelp === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with undefined api.yelp object");
        return Promise.resolve();
      }

      if (yelpReservations === undefined || tripReference?.city === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with undefined reservation");
        return Promise.resolve();
      }

      const currentReservation = yelpReservations?.find((reservation) => (reservation.value as Providers.Yelp.ReservationInfo).reservation_id === providerReservationId);

      if (currentReservation === undefined) {
        // eslint-disable-next-line no-console
        console.warn("memoizedReservationCancel called with unknown providerReservationId: ", providerReservationId);
        return Promise.resolve();
      }

      return reservationCancel(providerReservationId)?.then(() => {
        setYelpReservationDetailsModalState({ show: false });
      });
    },
    [reservationCancel, tripReference, yelpReservations]
  );

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

  // // our picks for you memos
  const memoizedSteps = useMemo(() => {
    const steps: {
      all: { step: Model.Step; dayIndex: number }[];
    } = {
      all: [],
    };

    const allSteps = plans?.reduce((previousValue: { step: Model.Step; dayIndex: number }[], currentValue: Model.Plan, currentIndex: number) => {
      if (currentValue) {
        const willShowSteps = currentValue.steps.filter((step) => {
          const stepReaction = reactions?.find((userReaction) => userReaction.stepId === step.id);

          if (stepReaction) {
            if (stepReaction.reaction === Model.REACTION.THUMBS_DOWN) {
              if ((stepReaction.comment || "") !== "") {
                return false; // Dont show this step in butterfly!
              }
            }
          }

          return true; // show this step
        });

        const memoStep: { step: Model.Step; dayIndex: number }[] = willShowSteps.map((willShowStep) => ({
          step: willShowStep,
          dayIndex: currentIndex,
        }));
        return previousValue.concat(memoStep);
      }
      return previousValue;
    }, []);

    if (allSteps) {
      steps.all = allSteps.sort((a, b) => a.dayIndex - b.dayIndex).sort((a, b) => Math.round(b.step.score || 2) - Math.round(a.step.score || 2));
    } else {
      steps.all = [];
    }

    return steps;
  }, [plans, reactions]);

  // our picks for you
  const memoizedThumbs = useCallback(
    (step: Model.Step) => {
      let t = 0;
      const stepReaction = reactions?.find((userReaction) => userReaction.stepId === step.id);
      if (stepReaction) {
        if (stepReaction.reaction === Model.REACTION.THUMBS_UP) {
          t = 1;
        } else if (stepReaction.reaction === Model.REACTION.THUMBS_DOWN) {
          t = -1;
        } else {
          // eslint-disable-next-line no-console
          console.warn("unknown step reaction", stepReaction.reaction);
        }
      } else {
        // console.log('no step reaction', step.id);
      }
      return t;
    },
    [reactions]
  );

  // our picks for you
  const memoizedThumbsClicked = useCallback(
    (step: Model.Step, thumbs: number) => {
      const userReactionRequest: Model.UserReactionRequest = {
        stepId: step.id,
        poiId: step.poi.id,
        reaction: Model.REACTION.THUMBS_UP,
      };
      if (thumbs === -1) {
        userReactionRequest.reaction = Model.REACTION.THUMBS_DOWN;
      }
      reactionAdd(userReactionRequest);
    },
    [reactionAdd]
  );

  // our picks for you
  const memoizedThumbsUndo = useCallback(
    (step: Model.Step) => {
      const stepUserReaction = reactions?.find((userReaction) => userReaction.stepId === step.id);
      if (stepUserReaction) {
        reactionDelete(stepUserReaction.id, step.id);
      } else {
        // eslint-disable-next-line no-console
        console.error(`ButterflyCard.ThumbsUndo called with =${step.id}`);
      }
    },
    [reactionDelete, reactions]
  );

  // // our picks for you
  // const memoizedComment = useCallback(
  //   (step: Model.Step, comment: Model.REACTION_COMMENT) => {
  //     // console.log('Comment', step.id);

  //     const stepUserReaction = userReactions.find((userReaction) => userReaction.stepId === step.id);

  //     if (stepUserReaction) {
  //       const reactionRequest: Model.UserReactionRequest = {
  //         stepId: stepUserReaction.stepId,
  //         poiId: stepUserReaction.poiId,
  //         reaction: Model.REACTION.THUMBS_DOWN, // stepUserReaction.reaction,
  //         comment,
  //       };

  //       api.combo
  //         .reactionUpdate(stepUserReaction.id, reactionRequest, hash)
  //         .then((userReactionResponse: Model.UserReaction[]) => {
  //           // console.log(stepUserReaction.id, 'comment ok.', comment);
  //           setUserReactions(userReactionResponse);
  //           // const updatedUserReactionIndex = userReactions.findIndex((userReaction) => userReaction.id === userReactionResponse.id);
  //           // if (updatedUserReactionIndex > -1) {
  //           //   const newUserReactions = helper.deepCopy(userReactions);
  //           //   newUserReactions[updatedUserReactionIndex] = userReactionResponse;
  //           //   setUserReactions(newUserReactions);
  //           // } else {
  //           //   console.error(`ButterflyCard.Comment updated step reaction not found, logical error! ${step.id}`);
  //           // }
  //         })
  //         .catch((reactionError) => {
  //           dispatch(saveError('reactionUpdate', 'Reaction Update', reactionError));
  //         });
  //     } else {
  //       // eslint-disable-next-line no-console
  //       console.error(`ButterflyCard.Comment step reaction not found =${step.id}`);
  //     }
  //   },
  //   [dispatch, hash, userReactions],
  // );

  // our picks for you
  const memoizedButterflyCardBodyClicked = useCallback((step: Model.Step) => {
    setPoiInfoModalState({ show: true, poiInfo: step.poi });
  }, []);

  // // our picks for you
  const memoizedIsFavorite = useCallback(
    (poiId?: string): boolean => {
      if (favorites) {
        return favorites.findIndex((favorite) => favorite.poiId === poiId) > -1;
      }
      return false;
    },
    [favorites]
  );

  // our picks for you
  // const memoizedButterflyCardSliderShowLoadingCard = useMemo(() => {
  //   if (plans) {
  //     return plans[plans.length - 1].generatedStatus === 0;
  //   }
  // }, [plans]);

  // our picks for you
  const memoizedFavoriteToggle = useCallback(
    (addFavorite: boolean, poiId?: string) => {
      if (poiId) {
        if (addFavorite) {
          favoriteAdd(poiId);
        } else {
          const favoriteId = favorites?.find((favorite) => favorite.poiId === poiId)?.id;
          if (favoriteId) {
            favoriteDelete(favoriteId, poiId);
          } else {
            // eslint-disable-next-line no-console
            console.error("memoizedFavoriteToggle favorite delete error: Can not found poi id in favorite list", addFavorite, poiId, favorites);
          }
        }
      }
    },
    [favoriteAdd, favoriteDelete, favorites]
  );

  // poi booking - tours match
  const poiTours = (poi: Model.Poi) => {
    const tourProviderBooking = poi.bookings.find((booking: Model.Booking) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(booking.providerId));
    const tourProducts: Model.BookingProduct[] = tourProviderBooking?.products.filter((product) => !product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET)) ?? [];
    return tourProducts;
  };

  // // poi booking - ticket match
  const poiTickets = (poi: Model.Poi) => {
    const ticketProviderBooking: Model.Booking | undefined = poi.bookings.find((booking: Model.Booking) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(booking.providerId));
    const ticketProducts: Model.BookingProduct[] = ticketProviderBooking?.products.filter((product) => product.info.includes(Model.BOOKING_PRODUCT_INFO.TICKET)).reverse() ?? [];
    return ticketProducts;
  };

  /* */
  /* */
  /* ******** TAB MENU ******** */
  const tabMenu = useMemo(
    () => (
      <>
        {/* <div className={classes.tripTabMenuFake} /> */}
        <div className={`col ${classes.tripTapMenu}`}>
          <TabMenu
            menuItems={[
              {
                title: "TRAVEL GUIDE",
                onClick: () => {},
              },
              {
                title: "ITINERARY PLANNER",
                onClick: () => {
                  history.push(`${TRIP_PLAN.PATH}/${hash}`);
                },
              },
            ]}
            selectedIndex={0}
          />
        </div>
      </>
    ),
    [hash, history]
  );
  /* ******** TAB MENU ******** */
  /* */
  /* */

  /* */
  /* */
  /* ********* CITY INFO ********* */
  const cityInfoDiv = useMemo(() => {
    if (tripReference?.city.description) {
      return (
        <div className="row p10">
          <div className="col col12 col5-m">
            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
              <ImgLazy
                src={tripReference ? helper.cityImgUrl(tripReference.city.image.url || "", 800, 500) : ""}
                alt=""
                x={800}
                y={500}
                showThumbnails={tripReference !== undefined}
              />
            </div>
            {/* {tripData ? (<img width="90%" style={{ borderRadius: '8px' }} src={helper.cityImgUrl(tripData?.city.image.url || '', 800, 500)} alt="" />) : null} */}
          </div>
          <div className="col col12 col7-m">
            <h1 className="py4">{tripReference?.city.name}</h1>
            <p className="" style={{ fontSize: ".8rem", lineHeight: "1.75rem" }}>
              {tripReference?.city.description}
            </p>
          </div>
        </div>
      );
    }
    return undefined;
  }, [tripReference]);
  /* ********* CITY INFO ********* */
  /* */
  /* */

  const cloneTrip = useCallback(() => {
    alert(tripReference?.tripHash + " clone lanacak!");
  }, [tripReference?.tripHash]);

  /* */
  /* */
  /* ******* POI INFO MODAL (TOP TEN - OUR PICKS FOR YOU)  ******* */
  const poiInfoModal = useMemo(
    () => (
      <Modal
        show={poiInfoModalState.show}
        className={`${classes.travelGuidePoiInfoModal} scrollable-y`}
        backdropClick={() => {
          setPoiInfoModalState({ show: false });
        }}
      >
        {poiInfoModalState.poiInfo ? (
          <div className="row mb0 pt10">
            <div className="col col12 col6-m p0 mb0">
              <PoiInfoImage
                poi={poiInfoModalState.poiInfo}
                close={() => {
                  setPoiInfoModalState({ show: false });
                }}
                square
                t={t}
              />
            </div>
            <div className="col col12 col6-m p0 mb0">
              <PoiInfoText
                poi={poiInfoModalState.poiInfo}
                favoriteLoading={loadingFavoritePoi(poiInfoModalState.poiInfo?.id)}
                favorite={memoizedIsFavorite(poiInfoModalState.poiInfo.id)}
                addRemoveReplacePoi={() => {}}
                hideActionButtons
                favoriteClick={(favorite: boolean) => {
                  if (tripReadOnly) {
                    cloneTrip();
                  } else {
                    memoizedFavoriteToggle(favorite, poiInfoModalState.poiInfo?.id);
                  }
                }}
                hideBookingButton
                RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
                hideButtons={false}
                t={t}
              />
            </div>

            {window.tconfig.SHOW_TOURS_AND_TICKETS && poiTickets(poiInfoModalState.poiInfo).length > 0 ? (
              <div className="col col12 p5">
                <h2 className="mb1 mt3">Buy Tickets</h2>
                {poiTickets(poiInfoModalState.poiInfo).map((bookingProduct) => (
                  <div key={bookingProduct.id} className="pt4">
                    <TourRefCardProduct
                      bookingProduct={bookingProduct}
                      clicked={() => {
                        setShowTourInfoModal(true);
                        fetchTourInfo(bookingProduct.id.toString()).then((success: boolean) => {
                          if (success === false) setShowTourInfoModal(false);
                        });
                      }}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {window.tconfig.SHOW_TOURS_AND_TICKETS && poiTours(poiInfoModalState.poiInfo).length > 0 ? (
              <div className="col col12 p5">
                <h2 className="mb1 mt3">Join Local Tours</h2>
                <span style={{ fontSize: ".85rem", fontWeight: "bold", color: "#e54e53dd" }}>Covering {poiInfoModalState.poiInfo.name || ""}</span>
                {poiTours(poiInfoModalState.poiInfo).map((bookingProduct) => (
                  <div key={bookingProduct.id} className="pt4">
                    <TourRefCardProduct
                      bookingProduct={bookingProduct}
                      clicked={() => {
                        setShowTourInfoModal(true);
                        fetchTourInfo(bookingProduct.id.toString()).then((success: boolean) => {
                          if (success === false) setShowTourInfoModal(false);
                        });
                      }}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    ),

    [
      cloneTrip,
      fetchTourInfo,
      loadingFavoritePoi,
      memoizedFavoriteToggle,
      memoizedIsFavorite,
      poiInfoModalState.poiInfo,
      poiInfoModalState.show,
      setShowTourInfoModal,
      t,
      tripReadOnly,
    ]
  );
  /* ********* POI INFO MODAL (TOP TEN - OUR PICKS FOR YOU)********* */
  /* */
  /* */

  /* */
  /* */
  /* ******* TOP TEN ******* */
  const topTenContent = useMemo(() => {
    if (topTenPois === undefined)
      return (
        <div>
          <h2 className={`${classes.ourPickHeader} mt10`}>TOP 10 THINGS TO SEE</h2>
          <span className={`${classes.ourPickSubHeader} ${classes.ourPickHeaderDesc} my2`}>{`Based on overall traveler reviews, these are the top attractions ${
            tripReference?.city.name || "city"
          } has the offer.`}</span>
          <div className={`${classes.travelGuidePx} ${classes.topTenToursLoading} my5`}>
            <PreLoading />
          </div>
        </div>
      );

    if (topTenPois.length === 0) return null;

    const topTenPoisSortedByBookingCount = [...topTenPois].sort(
      (x, y) =>
        y.bookings.filter((b) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(b.providerId)).length -
        x.bookings.filter((b) => window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(b.providerId)).length
    );

    return (
      <div>
        <h2 className={`${classes.ourPickHeader} mt10`}>TOP 10 THINGS TO SEE</h2>
        <span className={`${classes.ourPickSubHeader} ${classes.ourPickHeaderDesc} my2`}>{`Based on overall traveler reviews, these are the top attractions ${
          tripReference?.city.name || "city"
        } has the offer.`}</span>
        <div className={`${classes.travelGuidePx} my5`}>
          <CardSlider>
            {topTenPoisSortedByBookingCount.map((poi: Model.Poi) => (
              <div key={`top-ten-poi-card-${poi.id}`}>
                <ButterflyCard
                  data={{ poi }}
                  thumbsLoading={false}
                  thumbsClicked={() => {}}
                  undo={() => {}}
                  // comment={() => {}}
                  bodyClicked={() => {
                    setPoiInfoModalState({ show: true, poiInfo: poi });
                  }}
                />
              </div>
            ))}
          </CardSlider>
        </div>
      </div>
    );
  }, [topTenPois, tripReference]);
  /* ******* TOP TEN ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* OUR PICKS FOR YOU ******* */
  const ourPickForYou = useMemo(
    () => (
      <div className="container-fluid">
        <h2 className={`${classes.ourPickHeader} mt10`}>OUR PICKS FOR YOU</h2>
        <span className={`${classes.ourPickSubHeader} ${classes.ourPickHeaderDesc} my2`}>
          Based on your preferences, we picked the following spots and created day-by-day itineraries for you.
        </span>
        <div className={`${classes.travelGuidePx} my5`}>
          <ButterflyCardSlider
            steps={memoizedSteps.all /* .slice(0, 16) */}
            getThumbsNumber={memoizedThumbs}
            thumbsClicked={memoizedThumbsClicked}
            thumbsUndo={memoizedThumbsUndo}
            comment={() => {}}
            bodyClicked={memoizedButterflyCardBodyClicked}
            loadingSteps={loadingReactionStepList.map((reactionStep: number) =>
              // Todo we should decide using comment and step replace with user reaction. thumbsloading hardcoded added
              ({ stepId: reactionStep, thumbsLoading: true })
            )}
          />
        </div>
      </div>
    ),
    [loadingReactionStepList, memoizedButterflyCardBodyClicked, memoizedSteps.all, memoizedThumbs, memoizedThumbsClicked, memoizedThumbsUndo]
  );
  /* ******* OUR PICKS FOR YOU ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* LOCAL TOURS ******* */
  const tourModal = useMemo(() => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
      const closeGygTourInfoModal = () => {
        setShowTourInfoModal(false);
      };
      return (
        <Modal show={showTourInfoModal} className={`${classes.travelGuidePoiInfoModal} scrollable-y`} backdropClick={closeGygTourInfoModal}>
          {!loadingBbTourInfo && gygTourInfo?.tour ? (
            <GygTourInfoEx
              tour={gygTourInfo.tour}
              close={closeGygTourInfoModal}
              initialDate={""}
              adultCount={0}
              tourInfoFormCallback={function (date: string, adultCount: number, tourId: number, childrenCount?: number): void {
                throw new Error("Function not implemented.");
              }}
              bookingClick={function (bookingRequest: Providers.Gyg.TourBookingRequest): void {
                throw new Error("Function not implemented.");
              }}
              paymentClick={function (data: Providers.Gyg.TourShoppingFormData): void {
                throw new Error("Function not implemented.");
              }}
              startDate={""}
              endDate={""}
              t={t}
            />
          ) : (
            <div className={classes.tourModalLoading}>
              <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
            </div>
          )}
        </Modal>
      );
    }

    return null;
  }, [showTourInfoModal, loadingBbTourInfo, gygTourInfo.tour, t, setShowTourInfoModal]);
  /* ******* LOCAL TOURS ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* FAVORITES MODAL***** */
  const favoriteModalRenderContent = useCallback(() => {
    if (loadingFavorites && favorites === undefined)
      return (
        <div className={classes.travelGuideModalLoading}>
          <PreLoading />
        </div>
      );

    if (favorites) {
      if (favorites.length === 0)
        return (
          <div className="center mt8">
            <span>No favorites yet.</span>
          </div>
        );

      return favorites.map((favoritePoi: IFavoritePoi) =>
        loadingFavoritePoi(favoritePoi.poiId) ? (
          <div key={`favorite-poi-ref-card-loading-${favoritePoi.id}`} className={classes.favoriteItemsLoading}>
            <PreLoading key={`favorite-poi-ref-card-${favoritePoi.id}`} />
          </div>
        ) : (
          <PoiRefCard
            key={`favorite-poi-ref-card-${favoritePoi.id}`}
            poi={favoritePoi.poi}
            buttonType={-1}
            poiCardClicked={() => {
              setPoiInfoModalState({ show: true, poiInfo: favoritePoi.poi });
            }}
            addRemoveAlternativePoi={(poi: Model.Poi) => {
              const currentFavoriteId = (favorites || []).find((f) => f.poiId === poi.id)?.id;
              if (currentFavoriteId) {
                favoriteDelete(currentFavoriteId, poi.id);
                // eslint-disable-next-line no-console
              } else console.error("TravelGuide: favoriteDeleteAndFetch called with unknown favorite id");
            }}
            hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            hideOfferIcon={!window.tconfig.SHOW_OFFERS}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            t={t}
          />
        )
      );
    }

    return null;
  }, [favoriteDelete, favorites, loadingFavoritePoi, loadingFavorites, t]);

  const favoritesModal = useMemo(
    () => (
      <Modal
        className="scrollable-y"
        show={favoritesVisible}
        backdropClick={() => {
          setFavoritesVisible(false);
        }}
      >
        <div className="row m0">
          <div className="col col12  p5 m0">
            <h3 className="center">Favorites</h3>
            <div className={`${classes.travelGuideModalCloseIcon} m2`}>
              <CloseIconButton
                fill="#fff"
                clicked={() => {
                  setFavoritesVisible(false);
                }}
              />
            </div>
            {favoriteModalRenderContent()}
          </div>
        </div>
      </Modal>
    ),
    [favoritesVisible, favoriteModalRenderContent, setFavoritesVisible]
  );
  /* ******* FAVORITES MODAL ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* OFFERS MODAL***** */
  const offerModalRenderContent = useCallback(() => {
    if (loadingMyAllOffers && myAllOffers === undefined) {
      return (
        <div className={classes.travelGuideModalLoading}>
          <PreLoading />
        </div>
      );
    }

    if (myAllOffers) {
      if (myAllOffers.length === 0)
        return (
          <div className="center mt8">
            <span>No offers yet.</span>
          </div>
        );

      return myAllOffers.map((offerPoi: Model.Poi, i: number) => (
        <PoiOfferRefCard
          key={`my-offers-result-poi-${i}`}
          poi={offerPoi}
          poiCardClicked={(offerPoi: Model.Poi) => {
            setPoiInfoModalState({ show: true, poiInfo: offerPoi });
          }}
          planDate={currentPlanDate}
          isMyOffer={true}
        />
      ));
    }

    return null;
  }, [currentPlanDate, loadingMyAllOffers, myAllOffers]);

  const offersModal = useMemo(
    () => (
      <Modal
        className="scrollable-y"
        show={offersMyVisible}
        backdropClick={() => {
          setOffersMyVisible(false);
        }}
      >
        <div className="row m0">
          <div className="col col12  p5 m0">
            <h3 className="center">Offers</h3>
            <div className={`${classes.travelGuideModalCloseIcon} m2`}>
              <CloseIconButton
                fill="#fff"
                clicked={() => {
                  setOffersMyVisible(false);
                }}
              />
            </div>
            {offerModalRenderContent()}
          </div>
        </div>
      </Modal>
    ),
    [offerModalRenderContent, offersMyVisible, setOffersMyVisible]
  );
  /* ******* OFFERS MODAL ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* YELP RESERVATION DETAILS MODAL***** */
  const yelpReservationDetailsModal = useMemo(
    () => (
      <Modal
        show={yelpReservationDetailsModalState.show}
        className={`${classes.bookingModal} p5`}
        backdropClick={() => {
          if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
        }}
      >
        <div className="row m0">
          <div className={`${classes.travelGuideModalCloseIcon} m2`}>
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setYelpReservationDetailsModalState({ show: false });
              }}
            />
          </div>
          {yelpReservationDetailsModalState.reservationDetails ? (
            <div>
              {loadingReservation ? (
                <div className={classes.createUpdateTripLoading}>
                  <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
                </div>
              ) : null}
              <div>
                <ReservationDetails reservationInfo={yelpReservationDetailsModalState.reservationDetails} />
              </div>
              <div className="row center">
                <div>
                  <Button
                    color="primary"
                    text="Cancel Reservation"
                    onClick={() => {
                      setYelpReservationDetailsModalState((prevState) => ({
                        ...prevState,
                      }));
                      memoizedReservationCancel(yelpReservationDetailsModalState.reservationDetails?.reservation_id || "");
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    ),
    [yelpReservationDetailsModalState.show, yelpReservationDetailsModalState.reservationDetails, loadingReservation, memoizedReservationCancel]
  );
  /* ******* YELP RESERVATION DETAILS MODAL***** */
  /* */
  /* */

  /* */
  /* */
  /* ******* Gyg RESERVATION DETAILS MODAL***** */
  const gygReservationDetailsModal = useMemo(
    () => (
      <Modal
        show={gygReservationDetailsModalState.show}
        className={`${classes.bookingModal} p5`}
        backdropClick={() => {
          if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
        }}
      >
        <div className="row m0">
          <div className={`${classes.travelGuideModalCloseIcon} m2`}>
            <CloseIconButton
              fill="#fff"
              clicked={() => {
                if (!loadingReservation) setGygReservationDetailsModalState({ show: false });
              }}
            />
          </div>
          {gygReservationDetailsModalState.reservationDetails ? (
            <div>
              {loadingReservation ? (
                <div className={classes.createUpdateTripLoading}>
                  <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
                </div>
              ) : null}
              <div>
                <BookingDetails bookingInfo={gygReservationDetailsModalState.reservationDetails} />
              </div>
              <div className="row center">
                <div>
                  <Button
                    color="primary"
                    text="Cancel Reservation"
                    onClick={() => {
                      setGygReservationDetailsModalState((prevState) => ({
                        ...prevState,
                      }));
                      memoizedBookingCancel(gygReservationDetailsModalState.reservationDetails?.data.shopping_cart.shopping_cart_hash || "");
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    ),
    [gygReservationDetailsModalState.show, gygReservationDetailsModalState.reservationDetails, loadingReservation, memoizedBookingCancel]
  );
  /* ******* GYG RESERVATION DETAILS MODAL***** */
  /* */
  /* */

  /* */
  /* */
  /* ******* YOUR BOOKINGS MODAL***** */
  const yourBookingsModal = useMemo(
    () => (
      <Modal
        className={`${classes.tasteInfoYourBookingsModals} scrollable-y`}
        show={yourBookingsVisible}
        backdropClick={() => {
          setYourBookingsVisible(false);
        }}
      >
        <div className="row m0">
          <div className="col col12 p5  m0">
            <div className={`${classes.travelGuideModalCloseIcon} m2`}>
              <CloseIconButton
                fill="#fff"
                clicked={() => {
                  setYourBookingsVisible(false);
                }}
              />
            </div>
            <h3 className="center">Your Bookings</h3>
            {yelpReservations?.length === 0 && gygReservations?.length === 0 ? (
              <div className="center mt8">
                <span>No bookings yet.</span>
              </div>
            ) : (
              <>
                {yelpReservations?.map((yelpReservation) => {
                  const yelpReservationInfo = yelpReservation.value as Providers.Yelp.ReservationInfo;
                  return (
                    <div key={yelpReservationInfo.reservation_id} className="pt4">
                      <RefCard
                        image={yelpReservationInfo.restaurant_image}
                        title={yelpReservationInfo.restaurant_name}
                        butonText="VIEW RESERVATION"
                        subContext={`Covers : ${yelpReservationInfo.reservation_details.covers === 1 ? "1 person" : `${yelpReservationInfo.reservation_details.covers} people`}`}
                        clicked={() => {
                          setYelpReservationDetailsModalState({ show: true, reservationDetails: yelpReservationInfo });
                        }}
                      >
                        Date: {`${yelpReservationInfo.reservation_details.date}`}
                        <br />
                        Time : {` ${yelpReservationInfo.reservation_details.time}`}
                      </RefCard>
                    </div>
                  );
                })}
                {gygReservations?.map((gygReservation) => {
                  const gygReservationInfo = gygReservation.value as Providers.Gyg.TourReservationDetails;
                  console.log(gygReservationInfo.data);
                  return (
                    <div key={gygReservationInfo.data.shopping_cart.shopping_cart_hash} className="pt4">
                      <RefCard
                        image={gygReservationInfo.data.shopping_cart.tour_image}
                        title={gygReservationInfo.data.shopping_cart.tour_name}
                        butonText="VIEW TOUR BOOKING"
                        subContext={`Travelers : ${
                          gygReservationInfo.data.shopping_cart.bookings.length === 1 ? "1 person" : `${gygReservationInfo.data.shopping_cart.bookings.length} people`
                        }`}
                        clicked={() => {
                          setGygReservationDetailsModalState({ show: true, reservationDetails: gygReservationInfo });
                        }}
                      >
                        Date: {`${moment(gygReservationInfo.data.shopping_cart.bookings[0].bookable.datetime).format("MMM DD - HH:mm")}`}{" "}
                      </RefCard>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </Modal>
    ),
    [yourBookingsVisible, yelpReservations, gygReservations, setYourBookingsVisible]
  );
  /* ******* YOUR BOOKINGS MODAL ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* LOCAL TOURS ******* */
  const localTours = useMemo(() => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
      return (
        <>
          {loadingBbTourCatalog ? (
            <div className={`${classes.travelGuidePx} ${classes.topTenToursLoading}`}>
              <PreLoading />
            </div>
          ) : null}
          {gygToursCatalog && gygToursCatalog.length > 0 ? <h2 className={`${classes.ourPickHeader} mt10`}>BEST LOCAL EXPERIENCES</h2> : null}
          {gygToursCatalog?.map((tourCatalog: Providers.Gyg.CatalogGroup) => (
            <div key={`gygToursCatalogGroup-${tourCatalog.title}`}>
              <h3 className={`${classes.ourPickHeader} mt10`}>{tourCatalog.title}</h3>
              <div key={tourCatalog.title} className={`${classes.travelGuidePx} my5`}>
                <CardSlider>
                  {tourCatalog.items.map((tour: Providers.Gyg.Tour, index) => (
                    <div key={tour.tour_id} onKeyPress={() => {}} role="button" tabIndex={index}>
                      <GygTourCard
                        tour={tour}
                        bodyClicked={(tourr: Providers.Gyg.Tour) => {
                          setShowTourInfoModal(true);
                          fetchGygTourInfo(tourr.tour_id.toString()).then((success: boolean) => {
                            if (success === false) setShowTourInfoModal(false);
                          });
                        }}
                        t={t}
                      />
                    </div>
                  ))}
                </CardSlider>
              </div>
            </div>
          ))}
        </>
      );
    }

    return null;
  }, [fetchGygTourInfo, gygToursCatalog, loadingBbTourCatalog, setShowTourInfoModal, t]);
  /* ******* LOCAL TOURS ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* MUST TRY SLIDER ***** */
  const tasteModal = useMemo(
    () => (
      <Modal
        show={tasteInfoModalState.show}
        className={`${classes.tasteInfoYourBookingsModals} scrollable-y`}
        backdropClick={() => {
          setTasteInfoModalState({ show: false });
        }}
      >
        <div className="pt6">
          {tasteInfoModalState.taste ? (
            <TasteInfo
              pois={tastePois}
              poiClicked={(poi) => {
                setPoiInfoModalState({ show: true, poiInfo: poi });
              }}
              taste={tasteInfoModalState.taste}
              close={() => {
                setTasteInfoModalState({ show: false });
              }}
              loading={loadingTastePois}
              hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
              hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
              hideOfferIcon={!window.tconfig.SHOW_OFFERS}
              TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
              TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
              RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
              t={t}
            />
          ) : null}
        </div>
      </Modal>
    ),
    [tasteInfoModalState.show, tasteInfoModalState.taste, tastePois, loadingTastePois, t]
  );

  const tasteCards = useMemo(
    () =>
      tripReference?.city?.mustTries && tripReference.city.mustTries?.length > 0 ? (
        <div>
          <h2 className={`${classes.ourPickHeader} mt10`}>MUST-TRY FOOD</h2>
          <div className={`${classes.travelGuidePx} my5`}>
            <CardSlider>
              {tripReference.city.mustTries?.map((taste: Model.TasteItem) => (
                <div key={`must-try-card-${taste.id}`}>
                  <TasteCard2
                    taste={taste}
                    bodyClicked={(tasteClicked: Model.TasteItem) => {
                      tastePoisFetch(tasteClicked.id);
                      setTasteInfoModalState({ show: true, taste: tasteClicked });
                    }}
                  />
                </div>
              ))}
            </CardSlider>
          </div>
        </div>
      ) : null,
    [tastePoisFetch, tripReference]
  );
  /* ******* MUST TRY SLIDER ***** */
  /* */
  /* */

  /* */
  /* */
  /* RENDERS */
  // if (loadings.trip) {
  //   return <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />;
  // }

  const modal = () => {
    if (yelpReservationDetailsModalState.show) return yelpReservationDetailsModal;
    if (gygReservationDetailsModalState.show) return gygReservationDetailsModal;
    if (showTourInfoModal) return tourModal;
    if (poiInfoModalState.show) return poiInfoModal;
    if (tasteInfoModalState.show) return tasteModal;
    if (favoritesVisible) return favoritesModal;
    if (offersMyVisible) return offersModal;
    return null;
  };

  return (
    <>
      <AppNav
        tripInfoHeader={false}
        tripAppMenu={
          <TripAppMenu
            onClickBookings={() => {
              setYourBookingsVisible(true);
            }}
            onClickOffers={() => {
              setOffersMyVisible(true);
            }}
            onClickFavorites={() => {
              setFavoritesVisible(true);
            }}
            t={t}
          />
        }
      />

      {tabMenu}
      <div className={`${classes.travelGuideMainDiv} mb12`} style={{ marginTop: "60px" }}>
        {cityInfoDiv}

        {yourBookingsModal}

        {topTenContent}

        {ourPickForYou}

        {localTours}

        {tasteModal}
        {tasteCards}

        {modal()}
      </div>
    </>
  );
};

export default TravelGuidePage;
