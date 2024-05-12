/* eslint-disable react/require-default-props */

import React, { FC, useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";

import Model, { helper } from "@tripian/model";
import { AccommondationCard, DirectionInfo, RouteResult, ImgLazy, ItineraryCardSlider, SvgIcons, CustomSlider } from "@tripian/react";

import ICombinedState from "../../../../redux/model/ICombinedState";
import { changeReference } from "../../../../redux/action/trip";
import useTrip from "../../../../hooks/useTrip";
import usePlan from "../../../../hooks/usePlan";
import useStep from "../../../../hooks/useStep";
import useReaction from "../../../../hooks/useReaction";
import useAlternative from "../../../../hooks/useAlternative";
import useFocus from "../../../../hooks/useFocus";
import useTranslate from "../../../../hooks/useTranslate";
import SortableStepList from "../../../../components/SortableStepList/SortableStepList";
import ShareTripModal from "../../../../components/ShareTripModal/ShareTripModal";
import advanture from "./img/adventure.png";
import artmuseum from "./img/artmuseum.png";
import cultureHistory from "./img/culture history.png";
import localNeigborhood from "./img/local neighborhood.png";
import sightSeeing from "./img/sightseeing.png";
import food from "./img/food.png";
// import useUser from "../../../../hooks/useUser";
import { providers } from "@tripian/core";
import { LOCAL_EXPERIENCES, UPDATE_TRIP } from "../../../../constants/ROUTER_PATH_TITLE";
import { CloneModal } from "../../../../components/CloneModal/CloneModal";
import classes from "./Itineraries.module.scss";

// enum EXPLORE_MORE {
//   ATTRACTIONS = "Attractions",
//   RESTAURANTS = "Restaurants",
//   CAFES = "Cafes",
//   NIGHTLIFE = "Nightlife",
//   MUST_TRY = "Must Try",
// }

const getAccommendationStep = (accommendation: Model.Accommodation): Model.Step => {
  const accommendationPoi: Model.Poi = {
    id: "",
    icon: "Homebase",
    name: accommendation.name || "AccommendationState Name",
    description: accommendation.address || "AccommendationState Address",
    coordinate: accommendation.coordinate || { lat: 0, lng: 0 },
    web: accommendation.refID ?? "",
    address: accommendation.provider ?? "Google",
    image: {
      url: accommendation.imageUrl ?? "",
      imageOwner: { title: "", url: "" /* avatar: "" */ },
      width: null,
      height: null,
    },
    cityId: 0,
    gallery: [],
    price: 5,
    rating: 5,
    ratingCount: 0,
    phone: null,
    bookings: [],
    category: [],
    tags: [],
    mustTries: [],
    cuisines: null,
    attention: null,
    hours: null,
    closed: [],
    distance: null,
    status: true,
    safety: [],
    offers: [],
  };

  const accommendationStep: Model.Step = {
    id: 0,
    poi: accommendationPoi,
    alternatives: [],
    order: -1,
    score: null,
    scoreDetails: [],
    times: { from: "", to: "" },
    warningMessage: [],
    stepType: "poi",
  };

  return accommendationStep;
};

interface IItineraries {
  planDayIndex: number;
  changePlanDayIndex: (newPlanDayIndex: number) => void;
  alternativesStepId?: number;
  setAlternativesStepId: (stepId?: number) => void;
  showExplorePlaces: () => void;
  // showLocalExperiences: () => void;
  selectedPoiCategoryIndex: (index: number) => void;
  customPoiModalShow: () => void;
}

const Itineraries: FC<IItineraries> = ({
  planDayIndex,
  changePlanDayIndex,
  alternativesStepId,
  setAlternativesStepId,
  showExplorePlaces,
  // showLocalExperiences,
  selectedPoiCategoryIndex,
  customPoiModalShow,
}) => {
  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
  const [legsOffset, setLegsOffset] = useState<number>(0);
  const [showShareTripModal, setShowShareTripModal] = useState(false);
  const [shareTripMoalLoading, setShareTripModalLoading] = useState<boolean>(false);

  // const [saveTripLoading, setSaveTripLoading] = useState<boolean>(false);

  // const { tripReferencesSaved } = useUser();
  const { tripReference, tripShare } = useTrip();
  const { plans, planUpdateOrders } = usePlan();
  const { stepReplace, stepUpdateTimes, stepDelete } = useStep();
  const { alternatives } = useAlternative();
  const { reactions, reactionAdd, reactionDelete, loadingReactionStep } = useReaction();
  const { focusStep, focusAlternative, focusLost } = useFocus();

  const { t } = useTranslate();

  const plan = useMemo(() => (plans ? plans[planDayIndex] : undefined), [planDayIndex, plans]);
  const plansIdDate = useMemo(() => plans?.map((p) => ({ id: p.id, date: p.date })) || [], [plans]);
  const pastTrip = useMemo(() => {
    if (tripReference?.tripProfile.departureDatetime === undefined) return true;
    const now = moment(new Date()).format("X");
    const tripDate = (datetime: string) => moment(datetime).utcOffset(0).format("X");
    const tripDepartureDate = tripDate(tripReference.tripProfile.departureDatetime);
    return tripDepartureDate < now;
  }, [tripReference?.tripProfile.departureDatetime]);

  const { legs, readOnlyTrip, tripHash, shared } = useSelector((state: ICombinedState) => ({
    legs: state.gmap.legs,
    readOnlyTrip: state.trip.readOnly,
    tripHash: state.trip?.reference?.tripHash,
    shared: state.trip.reference?.shared,
  }));

  const history = useHistory();
  const dispatch = useDispatch();
  const { dayIndex } = useParams<{ dayIndex: string }>();
  const dayIndexNumber = isNaN(+dayIndex) ? 0 : +dayIndex;

  useEffect(() => {
    if (tripReference?.tripProfile.accommodation) setLegsOffset(1);
    else setLegsOffset(0);
  }, [tripReference]);

  // step current reactions
  const memoizedThumbs = useCallback(
    (step?: Model.Step) => {
      let t = 0;
      const stepReaction = reactions?.find((userReaction) => userReaction.stepId === step?.id && userReaction.poiId === step.poi.id);
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

  const memoizedThumbsClicked = useCallback(
    (step: Model.Step, thumbs: number) => {
      const userReactionRequest: Model.UserReactionRequest = {
        stepId: step.id,
        poiId: step.poi.id,
        reaction: Model.REACTION.THUMBS_UP,
      };
      if (thumbs === -1) userReactionRequest.reaction = Model.REACTION.THUMBS_DOWN;
      reactionAdd(userReactionRequest);
    },
    [reactionAdd]
  );

  const memoizedThumbsUndo = useCallback(
    (step: Model.Step) => {
      const stepUserReaction = reactions?.find((userReaction) => userReaction.stepId === step.id);
      if (stepUserReaction) {
        reactionDelete(stepUserReaction.id, stepUserReaction.stepId || 0);
      } else {
        // eslint-disable-next-line no-console
        console.error(`StepCard.ThumbsUndo called with =${step.id}`);
      }
    },
    [reactions, reactionDelete]
  );

  const emptyPlanMessage = () => {
    let message = t("trips.myTrips.itinerary.error.emptyMesssage");

    if (plans && plan) {
      if (planDayIndex === 0 && plan.generatedStatus === -1) {
        message = t("trips.myTrips.itinerary.error.generatedStatusNegative1");
      } else if (planDayIndex === plans.length - 1 && plans[plans.length - 1].generatedStatus === -1) {
        message = t("trips.myTrips.itinerary.error.generatedStatusNegative1");
      }
    }

    return message;
  };

  const alternativeDayNumbers = (alternativePois: Model.Poi[]): number[][] => {
    const getDayNumbers = (poiId: string): number[] => {
      if (poiId === "") return [];

      const partOfDayNumbers: number[] = [];
      if (plans) {
        for (let i = 0; i < plans.length; i += 1) {
          const stepIndex = plans[i].steps.findIndex((step) => step.poi.id === poiId);
          if (stepIndex > -1) {
            // console.log('alternativeDayNumbers dayNumber', stepIndex + 1);
            partOfDayNumbers.push(i + 1);
          }
        }
        return partOfDayNumbers;
      }
      return [];
    };

    return alternativePois.map((ap) => getDayNumbers(ap.id));
  };

  const windowOpenBookARide = (leg: RouteResult.ILeg) => {
    const bookARideUrl =
      leg.travel.between && leg.travel.between.pickup.coordinate
        ? `https://m.uber.com/?client_id=StrtxTcD7VgyYiUZyXF3-ViEhhkLzhZp&action=setPickup&pickup[latitude]=${leg.travel.between.pickup.coordinate.lat}&pickup[longitude]=${leg.travel.between.pickup.coordinate.lng}&pickup[nickname]=${leg.travel.between.pickup.nickname}&pickup[formatted_address]=${leg.travel.between.pickup.formatted_address}&dropoff[latitude]=${leg.travel.between.dropoff.coordinate.lat}&dropoff[longitude]=${leg.travel.between.dropoff.coordinate.lng}&dropoff[nickname]=${leg.travel.between.dropoff.nickname}&dropoff[formatted_address]=${leg.travel.between.dropoff.formatted_address}`
        : "https://m.uber.com";
    window.open(bookARideUrl);
  };

  const switchCheckedOnchange = (checked: boolean) => {
    if (tripReference) {
      if (tripHash && shared !== undefined) {
        setShareTripModalLoading(true);
        tripShare(tripHash, checked).finally(() => {
          setShareTripModalLoading(false);
          dispatch(changeReference({ ...tripReference, shared: checked }));
        });
      }
    }
  };

  /* const tripSavedAddRemove = (trihHash: string, add: boolean): Promise<boolean> => {
    setSaveTripLoading(true);
    if (add)
      return api
        .tripSavedAdd(trihHash)
        .then((tripReferencesSavedData: Model.TripReference[]) => {
          dispatch(changeTripReferencesSaved(tripReferencesSavedData));
          return true;
        })
        .finally(() => setSaveTripLoading(false));
    else
      return api
        .tripSavedRemove(trihHash)
        .then((tripReferencesSavedData: Model.TripReference[]) => {
          dispatch(changeTripReferencesSaved(tripReferencesSavedData));
          return true;
        })
        .finally(() => setSaveTripLoading(false));
  }; */

  const sortableStepList =
    plan?.steps.length === 0 || plan?.steps === undefined ? (
      <div className="m10">{emptyPlanMessage()}</div>
    ) : (
      <>
        {tripReference?.tripProfile.accommodation && legs[0] ? (
          <div className="ml-4 md:ml-6 py-4">
            <DirectionInfo
              distance={legs[0].distance.text}
              direction={legs[0].duration.text}
              travel={legs[0].travel}
              bookaride={() => {
                windowOpenBookARide(legs[0]);
              }}
              hideBookaRide={!window.tconfig.SHOW_BOOK_A_RIDE}
              t={t}
            />
          </div>
        ) : null}
        <SortableStepList
          steps={plan?.steps.sort((a, b) => a.order - b.order) || []}
          callbackSortableStepList={(list) => {
            if (readOnlyTrip) cloneTrip();
            else if (plan) planUpdateOrders(plan.id, list);
          }}
          alternatives={alternatives ?? []}
          alternativeDayNumbers={alternativeDayNumbers}
          alternativesStepId={alternativesStepId}
          showAlternativesChange={(stepId, show) => {
            setAlternativesStepId(show ? stepId : undefined);
          }}
          alternativePoiCardClicked={(stepId, alternativePoi) => {
            focusAlternative(stepId, alternativePoi);
          }}
          alternativeReplace={(stepId, alternativePoi) => {
            if (readOnlyTrip) cloneTrip();
            else {
              focusLost();
              stepReplace(stepId, alternativePoi.id);
            }
          }}
          memoizedThumbs={memoizedThumbs}
          thumbsClicked={(step, like) => {
            if (readOnlyTrip) cloneTrip();
            else {
              memoizedThumbsClicked(step, like);
            }
          }}
          timesClicked={(stepId, from, to) => {
            if (readOnlyTrip) cloneTrip();
            else {
              focusLost();
              stepUpdateTimes(stepId, from, to);
            }
          }}
          loadingReactionStep={loadingReactionStep}
          userReactionUndo={(step) => {
            if (readOnlyTrip) cloneTrip();
            else {
              memoizedThumbsUndo(step);
              setAlternativesStepId(undefined);
            }
          }}
          userReactionRemoveStep={(stepId) => {
            if (readOnlyTrip) cloneTrip();
            else {
              stepDelete(stepId);
            }
          }}
          focusStep={(step: Model.Step) => {
            focusStep(step);
          }}
          legs={legs}
          legsOffset={legsOffset}
          bookaride={() => windowOpenBookARide(legs[0])}
          t={t}
          /* readOnlyTrip={readOnlyTrip} */
        />
      </>
    );

  const accommendationMemo = useMemo(() => {
    if (tripReference?.tripProfile.accommodation) {
      const { accommodation } = tripReference.tripProfile;

      return (
        <div className="pr-2 ml-4 md:ml-6">
          <AccommondationCard
            accommodation={accommodation}
            clicked={() => {
              const accommendationStep = getAccommendationStep(accommodation);
              focusStep(accommendationStep);
            }}
          />
        </div>
      );
    }
    return null;
  }, [tripReference, focusStep]);

  const memoizedIsMobile = useMemo(() => {
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const tripArrivalDatetimeMoment = moment(tripReference?.tripProfile.arrivalDatetime).utcOffset(0);
  const tripDepartureDatetimeMoment = moment(tripReference?.tripProfile.departureDatetime).utcOffset(0);

  const areMonths_YearsDifferent = useMemo(() => {
    let latterMonth = "";
    let formerYear = "";
    if (tripArrivalDatetimeMoment.format("MMMM") !== tripDepartureDatetimeMoment.format("MMMM")) {
      latterMonth = tripDepartureDatetimeMoment.format("MMMM");
    }
    if (tripArrivalDatetimeMoment.format("YYYY") !== tripDepartureDatetimeMoment.format("YYYY")) {
      formerYear = tripArrivalDatetimeMoment.format("YYYY");
    }

    return { latterMonth: latterMonth, formerYear: formerYear };
  }, [tripArrivalDatetimeMoment, tripDepartureDatetimeMoment]);

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
        `${LOCAL_EXPERIENCES.PATH}?city_id=${tripReference?.city.id}&city_name=${tripReference?.city.name}&start_date=${startDate}&end_date=${endDate}&adult=${tripReference?.tripProfile.numberOfAdults}&children=${tripReference?.tripProfile.numberOfChildren}`
      );
    }
  };

  const cloneTrip = () => {
    setShowCloneModal(true);
  };

  const editTrip = () => {
    history.push(`${UPDATE_TRIP.PATH}/${tripHash}`);
  };

  return (
    <div className="h-full overflow-y-auto md:p-4">
      <div className="border border-solid border-gray-100 bg-background-color">
        <div className="relative h-52">
          <ImgLazy
            className="object-cover"
            src={tripReference ? helper.cityImgUrl(tripReference.city.image.url || "", 800, 500) : ""}
            alt=""
            x={800}
            y={500}
            showThumbnails={tripReference !== undefined}
          />
        </div>

        <div className="w-full relative -mt-14">
          <div className="bg-gray-100 opacity-90 my-0 mx-4 px-4 py-6 rounded-sm">
            <div className="flex flex-row flex-nowrap">
              <div className="font-medium flex justify-between w-full">
                <div className="block">
                  <div className="font-medium text-2xl text-black truncate">{tripReference?.city.name}</div>
                  {tripReference && (
                    <div className="text-s text-gray-600">
                      {tripArrivalDatetimeMoment.format("MMMM DD")} {areMonths_YearsDifferent.formerYear} - {areMonths_YearsDifferent.latterMonth}{" "}
                      {tripDepartureDatetimeMoment.format("DD")}, {tripDepartureDatetimeMoment.format("YYYY")}
                    </div>
                  )}
                </div>

                <div className="flex flex-row flex-nowrap">
                  <div className="border border-solid border-primary-color rounded-full flex items-center justify-center w-10 h-10 cursor-pointer mr-3" onClick={editTrip}>
                    <SvgIcons.Edit size="1.25rem" fill="var(--primary-color)" />
                  </div>
                  {readOnlyTrip ? (
                    <div className="border border-solid border-primary-color rounded-full flex items-center justify-center w-10 h-10 cursor-pointer mr-3" onClick={cloneTrip}>
                      <SvgIcons.Bookmark size="1.25rem" fill="var(--primary-color)" />
                    </div>
                  ) : (
                    <>
                      {window.tconfig.SHARED_TRIP && (
                        <div
                          className="border border-solid border-primary-color rounded-full flex items-center justify-center w-10 h-10 cursor-pointer"
                          onClick={() => setShowShareTripModal(true)}
                        >
                          <SvgIcons.Share size="1.25rem" fill="var(--primary-color)" className="primary-color" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {!pastTrip && (
              <>
                <div className="my-4 font-medium text-lg">{t("trips.myTrips.localExperiences.title")}</div>
                <div className="mt-4">
                  <ItineraryCardSlider slidesPerView={memoizedIsMobile ? 2 : 3}>
                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="advanture"
                    >
                      <img className="object-cover" src={advanture} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.adventure")}
                      </div>
                    </div>
                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="food"
                    >
                      <img className="object-cover" src={food} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.food")}
                      </div>
                    </div>
                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="cultureHistory"
                    >
                      <img className="object-cover" src={cultureHistory} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.cultureHistory")}
                      </div>
                    </div>
                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="sightSeeing"
                    >
                      <img className="object-cover" src={sightSeeing} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.sightSeeing")}
                      </div>
                    </div>
                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="artmuseum"
                    >
                      <img className="object-cover" src={artmuseum} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.artMuseum")}
                      </div>
                    </div>

                    <div
                      className="bg-background-color rounded-xl my-0 w-max-100 relative overflow-hidden h-24 flex items-center justify-center text-text-primary-color font-medium cursor-pointer min-w-[10rem]"
                      onClick={() => showLocalExperiences()}
                      key="localNeigborhood"
                    >
                      <img className="object-cover" src={localNeigborhood} alt="" />
                      <div className="absolute font-semibold opacity-90 center text-white drop-shadow-[1px_1px_1px_rgb(0,0,0)]">
                        {t("trips.myTrips.localExperiences.categories.localNeighborhood")}
                      </div>
                    </div>
                  </ItineraryCardSlider>
                </div>
              </>
            )}
          </div>
          <div className="my-4 px-6">
            <div className="my-4 font-medium text-lg">{t("trips.myTrips.exploreMore.title")}</div>
            <div className="py-1">
              {/* <div className="hs-tooltip inline-block [--trigger:click]">
                <a className="hs-tooltip-toggle block text-center" href="javascript:;">
                  <span className="w-10 h-10 inline-flex justify-center items-center gap-2 rounded-md bg-gray-50 border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[.05] dark:hover:border-white/[.1] dark:hover:text-white">
                    <svg className="w-2.5 h-2.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2.27921 10.64L7.92565 4.99357C8.12091 4.79831 8.4375 4.79831 8.63276 4.99357L14.2792 10.64"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                  <div
                    className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-3 px-4 bg-white border text-sm text-gray-600 rounded-md shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
                    role="tooltip"
                  >
                    Top popover
                  </div>
                </a>
              </div> */}
              <CustomSlider scrollSize={150}>
                <div
                  className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap"
                  onClick={() => {
                    showExplorePlaces();
                    selectedPoiCategoryIndex(0);
                  }}
                >
                  <SvgIcons.Attraction size="20px" className="mr-3" fill="black" />
                  {t("trips.myTrips.exploreMore.categories.attractions")}
                </div>
                <div
                  className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap"
                  onClick={() => {
                    showExplorePlaces();
                    selectedPoiCategoryIndex(1);
                  }}
                >
                  <SvgIcons.Restaurant size="18px" className="mr-3" fill="black" />
                  {t("trips.myTrips.exploreMore.categories.restaurants")}
                </div>
                <div
                  className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap"
                  onClick={() => {
                    showExplorePlaces();
                    selectedPoiCategoryIndex(2);
                  }}
                >
                  <SvgIcons.Cafe size="18px" className="mr-3" fill="black" />
                  {t("trips.myTrips.exploreMore.categories.cafes")}
                </div>
                <div
                  className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap"
                  onClick={() => {
                    showExplorePlaces();
                    selectedPoiCategoryIndex(3);
                  }}
                >
                  <SvgIcons.NightLife size="20px" className="mr-3" fill="black" />
                  {t("trips.myTrips.exploreMore.categories.nightlife")}
                </div>
                <div
                  className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap"
                  onClick={() => {
                    showExplorePlaces();
                    selectedPoiCategoryIndex(4);
                  }}
                >
                  <SvgIcons.Shopping size="20px" className="mr-3" fill="black" />
                  {t("trips.myTrips.exploreMore.categories.shopping")}
                </div>
                {/* {0 < (tripReference?.city.mustTries.length ?? 0) ? (
                  <div
                    className="text-sm !w-auto bg-white rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer text-black font-medium flex items-center justify-center whitespace-nowrap min-w-fit"
                    onClick={() => {
                      showExplorePlaces();
                      selectedPoiCategoryIndex(6);
                    }}
                  >
                    <SvgIcons.MustTry size="20px" className="mr-3" fill="black" />
                    {EXPLORE_MORE.MUST_TRY}
                  </div>
                ) : (
                  <></>
                )} */}
              </CustomSlider>
            </div>
          </div>
          <div className="my-4 px-6">
            <div className="my-4 font-medium text-lg">{t("trips.myTrips.itinerary.title")}</div>
            {plansIdDate.length > 0 ? (
              <div className="py-1">
                <CustomSlider scrollSize={150}>
                  {plansIdDate.map((planIdDate, index) => {
                    return (
                      <div
                        key={index}
                        className={`text-sm !w-auto rounded-3xl border border-solid border-gray-300 my-0 py-1 px-4 cursor-pointer min-w-fit font-medium whitespace-nowrap ${
                          planDayIndex === index ? "text-white bg-primary-color" : "text-black bg-white"
                        }`}
                        onClick={() => changePlanDayIndex(index)}
                      >
                        {t("trips.myTrips.itinerary.day")} <span>{plansIdDate.findIndex((o) => o.id === planIdDate.id) + 1}</span>
                        <span>
                          {planDayIndex === index && (
                            <>
                              <span> - </span>
                              <span>{moment(planIdDate.date).format("MMM DD")}</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </CustomSlider>
              </div>
            ) : null}
          </div>
          {process.env.REACT_APP_API_URL !== "https://gyssxjfp9d.execute-api.eu-west-1.amazonaws.com/prodnext" && (
            <div className="my-4 px-6">
              <div className="my-4 font-normal text-lg">{t("trips.myTrips.itinerary.customPoiModal.addYourCustomizeStep")}</div>
              {/* <div className="w-full flex justify-start mb-4"> */}
              <div
                className="text-sm rounded-3xl border border-solid border-gray-300 my-0 py-2 px-4 cursor-pointer text-center font-medium whitespace-nowrap text-black bg-background-color max-w-fit"
                onClick={() => customPoiModalShow()}
              >
                {t("trips.myTrips.itinerary.customPoiModal.button")}
              </div>
              {/* </div> */}
            </div>
          )}
          <div className={`${classes.stepList}`}>
            {plan?.generatedStatus === 2 && <div className="ml-7 my-4 text-sm text-yellow-400">{t("trips.myTrips.itinerary.error.generatedStatus2")}</div>}
            {plan?.generatedStatus === 3 && <div className="ml-7 my-4 text-sm text-yellow-400">{t("trips.myTrips.itinerary.error.generatedStatus3")}</div>}
            {accommendationMemo}
            {sortableStepList}
          </div>
          {tripReference && (
            <>
              <ShareTripModal
                showModal={showShareTripModal}
                setShowModal={() => setShowShareTripModal(!showShareTripModal)}
                loading={shareTripMoalLoading}
                switchChecked={tripReference.shared}
                onChange={switchCheckedOnchange}
                cityName={tripReference?.city.name}
                arrivalDatetime={tripReference.tripProfile.arrivalDatetime}
                departureDatetime={tripReference.tripProfile.departureDatetime}
                tripHash={tripReference.tripHash}
                dayIndex={dayIndexNumber}
              />
            </>
          )}
        </div>
      </div>
      {showCloneModal && <CloneModal sharedTripHash={tripReference?.tripHash ?? ""} onCancel={() => setShowCloneModal(false)} />}
    </div>
  );
};

export default Itineraries;
