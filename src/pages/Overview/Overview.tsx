import moment from "moment";
import { providers } from "@tripian/core";
import Model, { Providers } from "@tripian/model";
import { ButterflyCardSlider, Button, CloseIconButton, Modal, PoiInfoImage, PoiInfoText, PoiRefCard, PreLoading, RefCard, ReservationDetails, TabMenu } from "@tripian/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useHistory } from "react-router";
import AppNav from "../../App/AppNav/AppNav";
import TripAppMenu from "../../App/AppNav/TripMenu/TripAppMenu";
import { OVERVIEW, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import useFavorite from "../../hooks/useFavorite";
import usePlan from "../../hooks/usePlan";
import useReaction from "../../hooks/useReaction";
import useReservation from "../../hooks/useReservation";
import useTrip from "../../hooks/useTrip";
import IFavoritePoi from "../../models/IFavoritePoi";
import useLayoutPlan from "../TripPlan/hooks/useLayoutPlan";
import useTranslate from "../../hooks/useTranslate";
import classes from "./Overview.module.scss";
// import covid from "./covid.png";

const OverviewPage = () => {
  const { tripReference, tripClear, tripFetch, tripReadOnly } = useTrip();
  const { cityId, favorites, loadingFavorites, favoriteAdd, favoriteDelete, loadingFavoritePoi, favoritesFetch } = useFavorite();
  const { plans, planFetch } = usePlan();
  const { reactions, reactionAdd, reactionDelete, loadingReactionStepList } = useReaction();
  const { yelpReservations, gygReservations, loadingReservation, reservationCancel, initReservations } = useReservation();
  const { favoritesVisible, setFavoritesVisible, setOffersMyVisible, yourBookingsVisible, setYourBookingsVisible } = useLayoutPlan();

  const { t } = useTranslate();

  /* const [covidWarning, setCovidWarning] = useState<boolean>(plans ? plans[plans.length - 1].generatedStatus === 0 : false); */

  useEffect(() => {
    initReservations();
  }, [initReservations]);

  useEffect(() => {
    if (favorites === undefined && loadingFavorites === false && cityId !== undefined) favoritesFetch();
  }, [cityId, favorites, favoritesFetch, loadingFavorites]);

  /* */
  /* */
  /* ******* POI INFO (TOP TEN - OUR PICKS FOR YOU) ******* */
  const [poiInfoModalState, setPoiInfoModalState] = useState<{ show: boolean; poiInfo?: Model.Poi; planDate?: string }>({ show: false });
  /* ******* POI INFO (TOP TEN - OUR PICKS FOR YOU)******* */
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

  const { hash } = useParams<{ hash: string }>();
  const history = useHistory();

  document.title = OVERVIEW.TITLE();

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

  // // our picks for you memos
  // const memoizedSteps = useMemo(() => {
  //   const steps: {
  //     all: { step: Model.Step; dayIndex: number }[];
  //   } = {
  //     all: [],
  //   };

  //   const allSteps = plans?.reduce((previousValue: { step: Model.Step; dayIndex: number }[], currentValue: Model.Plan, currentIndex: number) => {
  //     if (currentValue) {
  //       const willShowSteps = currentValue.steps.filter((step) => {
  //         const stepReaction = reactions?.find((userReaction) => userReaction.stepId === step.id);

  //         if (stepReaction) {
  //           if (stepReaction.reaction === Model.REACTION.THUMBS_DOWN) {
  //             if ((stepReaction.comment || '') !== '') {
  //               return false; // Dont show this step in butterfly!
  //             }
  //           }
  //         }

  //         return true; // show this step
  //       });

  //       const memoStep: { step: Model.Step; dayIndex: number }[] = willShowSteps.map((willShowStep) => ({
  //         step: willShowStep,
  //         dayIndex: currentIndex,
  //       }));
  //       return previousValue.concat(memoStep);
  //     }
  //     return previousValue;
  //   }, []);

  //   if (allSteps) {
  //     steps.all = allSteps.sort((a, b) => a.dayIndex - b.dayIndex).sort((a, b) => Math.round(b.step.score || 2) - Math.round(a.step.score || 2));
  //   } else {
  //     steps.all = [];
  //   }

  //   return steps;
  // }, [plans, reactions]);

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

  // our picks for you
  const memoizedButterflyCardBodyClicked = useCallback((step: Model.Step, planDate: string) => {
    setPoiInfoModalState({ show: true, poiInfo: step.poi, planDate });
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

  /* */
  /* */
  /* ******** TAB MENU ******** */
  const tabMenu = useMemo(
    () => (
      <>
        {/* <div className="trip-tab-menu-fake" /> */}
        <div className={`col ${classes.tripTabMenu}`}>
          <TabMenu
            menuItems={[
              {
                title: "OVERVIEW",
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

  const cloneTrip = useCallback(() => {
    alert(tripReference?.tripHash + " clone lanacak!");
  }, [tripReference?.tripHash]);

  /* */
  /* */
  /* ******* POI INFO MODAL (OUR PICKS FOR YOU)  ******* */
  const poiInfoModal = useMemo(
    () => (
      <Modal
        show={poiInfoModalState.show}
        className={`${classes.overviewGuidePoiInfoModal} scrollable-y`}
        backdropClick={() => {
          setPoiInfoModalState({ show: false });
        }}
      >
        {poiInfoModalState.poiInfo ? (
          <div className="row mb0">
            <div className="col col12 col6-m p0 mb0">
              <PoiInfoImage
                poi={poiInfoModalState.poiInfo}
                close={() => {
                  setPoiInfoModalState({ show: false });
                }}
                square
                hideButtons={false}
                t={t}
              />
            </div>
            <div className="col col12 col6-m p0 mb0">
              <PoiInfoText
                poi={poiInfoModalState.poiInfo}
                favoriteClick={(favorite: boolean) => {
                  if (tripReadOnly) {
                    cloneTrip();
                  } else {
                    memoizedFavoriteToggle(favorite, poiInfoModalState.poiInfo?.id);
                  }
                }}
                addRemoveReplacePoi={() => {}}
                hideActionButtons
                favorite={memoizedIsFavorite(poiInfoModalState.poiInfo.id)}
                favoriteLoading={loadingFavoritePoi(poiInfoModalState.poiInfo?.id)}
                hideBookingButton
                planDate={poiInfoModalState.planDate}
                RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
                hideFavoriteIcon={false}
                t={t}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    ),

    [cloneTrip, loadingFavoritePoi, memoizedFavoriteToggle, memoizedIsFavorite, poiInfoModalState.planDate, poiInfoModalState.poiInfo, poiInfoModalState.show, t, tripReadOnly]
  );
  /* ********* POI INFO MODAL (OUR PICKS FOR YOU)********* */
  /* */
  /* */

  /* const covidWarningMessage = useMemo(
    () =>
      covidWarning ? (
        <div className="covid-warn">
          <img alt="Covid-19 Updates" src={covid} className="covid-warn-logo" />
          <span className="covid-warn-text">
            Please be advised that due to COVID-19 restrictions, temporarily or permanently closed locations are not displayed.
            <br />
            <span className="covid-warn-text-sub">Latest Database Update: Dec 16 2020.</span>
          </span>
          <div
            role="button"
            className="covid-warn-close"
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={() => {
              setCovidWarning(false);
            }}
          >
            X
          </div>
        </div>
      ) : null,
    [covidWarning]
  ); */

  /* */
  /* */
  /* ******* OUR PICKS FOR YOU ******* */
  const ourPickForYou = useMemo(() => {
    const days = plans?.map((plan, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`ourPickForYou-day-${index}`}>
        <h2 className={`${classes.ourPickDayHeader} mt10`}>
          {moment(plan.date).format("MMM D")} - Day {index + 1}
        </h2>
        <div className={`${classes.overviewGuidePx} my5`}>
          {plan.generatedStatus === 0 ? (
            <div style={{ height: "370px" }}>
              <PreLoading />
            </div>
          ) : (
            <ButterflyCardSlider
              steps={plan.steps.map((step) => ({ step, dayIndex: index }))}
              getThumbsNumber={memoizedThumbs}
              thumbsClicked={memoizedThumbsClicked}
              thumbsUndo={memoizedThumbsUndo}
              comment={() => {}}
              bodyClicked={(s: Model.Step) => {
                memoizedButterflyCardBodyClicked(s, `${plan.date} ${plan.startTime}`);
              }}
              loadingSteps={loadingReactionStepList.map((reactionStep: number) =>
                // Todo we should decide using comment and step replace with user reaction. thumbsloading hardcoded added
                ({ stepId: reactionStep, thumbsLoading: true })
              )}
            />
          )}
        </div>
      </div>
    ));

    return (
      <div className="container-fluid pb10">
        {/* {covidWarningMessage} */}
        <h2 className={`${classes.ourPickHeader} pt10`}>OUR PICKS FOR YOU</h2>

        <span className={`${classes.ourPickSubHeader} ${classes.ourPickHeaderDesc} my2`}>
          Based on your preferences, we picked the following spots and created day-by-day itineraries for you.
        </span>
        {days || (
          <div style={{ height: "370px" }}>
            <PreLoading />
          </div>
        )}
      </div>
    );
  }, [/* covidWarningMessage, */ loadingReactionStepList, memoizedButterflyCardBodyClicked, memoizedThumbs, memoizedThumbsClicked, memoizedThumbsUndo, plans]);
  /* ******* OUR PICKS FOR YOU ******* */
  /* */
  /* */

  /* */
  /* */
  /* ******* FAVORITES MODAL***** */
  const favoriteModalRenderContent = useCallback(() => {
    if (loadingFavorites && favorites === undefined)
      return (
        <div className={classes.overviewGuideModalLoading}>
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
              } else console.error("Overview: favoriteDeleteAndFetch called with unknown favorite id");
            }}
            hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            hideOfferIcon={!window.tconfig.SHOW_OFFERS}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            gygTourIds={[]}
            bbTourIds={[]}
            viatorTourIds={[]}
            toristyTourIds={[]}
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
            <div className={`${classes.overviewGuideModalCloseIcon} m2`}>
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
          <div className={`${classes.overviewGuideModalCloseIcon} m2`}>
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
                <ReservationDetails reservationInfo={yelpReservationDetailsModalState.reservationDetails} t={t} />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [yelpReservationDetailsModalState.show, yelpReservationDetailsModalState.reservationDetails, loadingReservation, memoizedReservationCancel]
  );
  /* ******* YELP RESERVATION DETAILS MODAL***** */
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
            <div className={`${classes.overviewGuideModalCloseIcon} m2`}>
              <CloseIconButton
                fill="#fff"
                clicked={() => {
                  setYourBookingsVisible(false);
                }}
              />
            </div>
            <h3 className={`center ${classes.bookingPopUp}`}>Your Bookings</h3>
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
                          // setYelpReservationDetailsModalState({ show: true, reservationDetails: yelpReservationInfo });
                        }}
                      >
                        Date: {`${moment(gygReservationInfo.data.shopping_cart.bookings[0].bookable.datetime).format("MMM DD - HH:mm")}`}
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
  /* RENDERS */
  // if (loadings.trip) {
  //   return <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />;
  // }

  const modal = () => {
    if (yelpReservationDetailsModalState.show) return yelpReservationDetailsModal;
    if (poiInfoModalState.show) return poiInfoModal;
    if (favoritesVisible) return favoritesModal;
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
      <div className={`${classes.overviewGuideMainDiv} mb12`} style={{ marginTop: "48px" }}>
        {yourBookingsModal}

        {ourPickForYou}

        {modal()}
      </div>
    </>
  );
};

export default OverviewPage;
