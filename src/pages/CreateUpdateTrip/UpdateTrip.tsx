import React, { useState, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";

import Model, { helper } from "@tripian/model";
import { PreLoading, Notification, FormTemplateTripNext } from "@tripian/react";

import { UPDATE_TRIP, TRIPS, /* USE_TRIP_URL, */ TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";

import useTripForm from "../../hooks/useTripForm";
import useCompanion from "../../hooks/useCompanion";
import useTrip from "../../hooks/useTrip";
import useUser from "../../hooks/useUser";
import useTranslate from "../../hooks/useTranslate";
import AppNav from "../../App/AppNav/AppNav";
import { stepHeaders, destinationTips, travelerInfoTips, questionDefaultTip } from "../../config/tripFormContents";
import TripLoading from "../../components/TripLoading/TripLoading";
import classes from "./CreateUpdateTrip.module.scss";

const UpdateTripPage = () => {
  const { loadingCities, loadingQuestionsTrip, loadingQuestionsCompanion, cities, questionsTrip, questionsCompanion } = useTripForm();
  const [showWarningMessage, setShowWarningMessage] = useState<number>(0);

  const [tripProfileFormData, setTripProfileFormData] = useState<Model.TripProfile | undefined>(undefined);
  const [initialState, setInitialState] = useState<Model.TripProfile | undefined>(undefined);

  const { t } = useTranslate();

  const { tripReferences } = useUser();
  const { companions, companionAdd, loadingCompanions } = useCompanion();
  const { tripReference, tripUpdate, loadingTripUpdate, tripFetchCallback, tripReferenceFetch } = useTrip();

  const { hashParam } = useParams<{ hashParam: string }>();
  const hash = useMemo(() => hashParam.split("!")[0], [hashParam]);
  const history = useHistory();

  document.title = UPDATE_TRIP.TITLE(t("trips.updateTrip.header"));

  useEffect(() => {
    let unmonted = false;

    if (tripReference) {
      // from: TripPage or TravelGuide

      if (hash !== tripReference.tripHash) {
        // Olmaması gereken bir durum. Bir süre kalsın dedik.
        console.error("redux da tripReference.tripHash var, url den farklı! Nasıl olur!: ", tripReference, tripReference.tripHash, hash); // eslint-disable-line no-console
        history.push(TRIPS.PATH);
      }

      setTripProfileFormData(tripReference.tripProfile);
      setInitialState(tripReference.tripProfile);
    } else {
      const willUpdateTripReference = tripReferences?.find((tr) => tr.tripHash === hash);

      if (willUpdateTripReference) {
        // from: TripsPage
        setTripProfileFormData(willUpdateTripReference.tripProfile);
        setInitialState(willUpdateTripReference.tripProfile);
      } else {
        // from: Directly Url
        tripReferenceFetch(hash).then((responseTripReference: Model.TripReference) => {
          if (!unmonted) {
            setTripProfileFormData(responseTripReference.tripProfile);
            setInitialState(responseTripReference.tripProfile);
          }
        });
      }
    }

    return () => {
      unmonted = true;
    };
  }, [hash, tripReferences, tripReference, tripReferenceFetch, history]);

  const checkWarning = (tripProfileParam: Model.TripProfile) => {
    if (showWarningMessage === 0) {
      if (tripProfileParam.companionIds.length > tripProfileParam.numberOfAdults + (tripProfileParam.numberOfChildren || 0) - 1) {
        setShowWarningMessage(1);
      }
    }
  };

  const areDiffObject = (prevObject: any, currentObject: any) => {
    const prevObjectString = JSON.stringify(prevObject);
    const currentObjectString = JSON.stringify(currentObject);

    if (prevObjectString !== currentObjectString) {
      return true;
    }

    return false;
  };

  const callbackTripProfile = (tripProfileParam: Model.TripProfile) => {
    setTripProfileFormData(tripProfileParam);
    checkWarning(tripProfileParam);
  };

  const tripCancel = () => {
    history.goBack();
  };

  const callbackUserCompanionAdd = async (companion: Model.Companion) => {
    companionAdd(companion as Model.CompanionRequest).then((companionAddResponse: Model.Companion[]) => {
      const companionIds = companions?.map((c) => c.id);
      const companionId = companionAddResponse.find((c) => !companionIds?.includes(c.id))?.id;
      const newTripProfile = helper.deepCopy(tripProfileFormData);
      if (companionId) {
        newTripProfile?.companionIds.push(companionId);
        setTripProfileFormData(newTripProfile);
      }
    });
  };

  const onTripUpdate = (doNotGenerate = 0) => {
    if (tripProfileFormData) {
      const newTripProfileFormData = { ...tripProfileFormData };
      newTripProfileFormData.doNotGenerate = doNotGenerate;

      tripUpdate(hash, newTripProfileFormData).then((trip: Model.Trip) => {
        tripFetchCallback(trip);
        history.push(`${TRIP_PLAN.PATH}/${hashParam}`);
      });
    }
  };

  const updateButtonClick = () => {
    if (initialState && tripProfileFormData) {
      const isAccommendationValueChanged = areDiffObject(initialState.accommodation || {}, tripProfileFormData.accommodation || {});
      const isDefaultStateChanged = areDiffObject(
        {
          ...initialState,
          accommodation: null,
          answers: [...initialState.answers].sort((a, b) => a - b),
          companionIds: [...initialState.companionIds].sort((a, b) => a - b),
        },
        {
          ...tripProfileFormData,
          accommodation: null,
          answers: [...tripProfileFormData.answers].sort((a, b) => a - b),
          companionIds: [...tripProfileFormData.companionIds].sort((a, b) => a - b),
        }
      );

      if (!isDefaultStateChanged && isAccommendationValueChanged) {
        onTripUpdate(); // 1);
      } else if (isDefaultStateChanged) {
        onTripUpdate();
      } else {
        onTripUpdate();
      }
    }
  };

  // const isButtonDisabled = !tripProfileFormData || moment(tripProfileFormData.arrivalDatetime).utcOffset(0) < moment().utcOffset(0);

  // Renders
  if (loadingCities || loadingQuestionsTrip || loadingQuestionsCompanion || loadingCompanions || questionsTrip === undefined)
    return (
      <>
        <AppNav header={UPDATE_TRIP.HEADER?.(t("trips.updateTrip.header"))} />
        <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
      </>
    );

  return (
    <>
      <AppNav header={UPDATE_TRIP.HEADER?.(t("trips.updateTrip.header"))} />
      <div className="background" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
        {loadingTripUpdate ? (
          <div className={classes.createUpdateTripLoading}>
            <TripLoading t={t} />
          </div>
        ) : (
          <>
            {tripProfileFormData ? (
              <div className={classes.formTemplateTripNextContainer}>
                <FormTemplateTripNext
                  cities={cities || []}
                  tripProfile={tripProfileFormData}
                  tripQuestions={questionsTrip}
                  callbackTripProfile={callbackTripProfile}
                  userCompanionQuestions={questionsCompanion || []}
                  companionLoadingList={
                    []
                    /* companionLoadingList */
                  }
                  callbackUserCompanionAdd={callbackUserCompanionAdd}
                  userCompanions={companions || []}
                  isTripEdit
                  showTripModeQuestion={window.tconfig.SHOW_TRIP_MODE_QUESTION}
                  stepHeaders={stepHeaders([
                    t("trips.createNewTrip.stepHeaders.destination"),
                    t("trips.createNewTrip.stepHeaders.travelerInfo"),
                    t("trips.createNewTrip.stepHeaders.itineraryProfile"),
                    t("trips.createNewTrip.stepHeaders.personalInterests"),
                  ])}
                  destinationTips={destinationTips([
                    { title: t("trips.createNewTrip.questionDefaultTip.hover.title"), description: t("trips.createNewTrip.questionDefaultTip.hover.description") },
                    { title: t("trips.createNewTrip.destinationTips.destination.title"), description: t("trips.createNewTrip.destinationTips.destination.description") },
                    { title: t("trips.createNewTrip.destinationTips.arrivalDate.title"), description: t("trips.createNewTrip.destinationTips.arrivalDate.description") },
                    { title: t("trips.createNewTrip.destinationTips.departureDate.title"), description: t("trips.createNewTrip.destinationTips.departureDate.description") },
                    { title: t("trips.createNewTrip.destinationTips.arrivalHours.title"), description: t("trips.createNewTrip.destinationTips.arrivalHours.description") },
                    { title: t("trips.createNewTrip.destinationTips.departureHours.title"), description: t("trips.createNewTrip.destinationTips.departureHours.description") },
                  ])}
                  travelerInfoTips={travelerInfoTips([
                    { title: t("trips.createNewTrip.questionDefaultTip.hover.title"), description: t("trips.createNewTrip.questionDefaultTip.hover.description") },
                    { title: t("trips.createNewTrip.travelerInfoTips.travelers.title"), description: t("trips.createNewTrip.travelerInfoTips.travelers.description") },
                    { title: t("trips.createNewTrip.travelerInfoTips.children.title"), description: t("trips.createNewTrip.travelerInfoTips.children.description") },
                    { title: t("trips.createNewTrip.travelerInfoTips.startingPoint.title"), description: t("trips.createNewTrip.travelerInfoTips.startingPoint.description") },
                    { title: t("trips.createNewTrip.travelerInfoTips.companions.title"), description: t("trips.createNewTrip.travelerInfoTips.companions.description") },
                  ])}
                  questionDefaultTip={questionDefaultTip({
                    title: t("trips.createNewTrip.questionDefaultTip.hover.title"),
                    description: t("trips.createNewTrip.questionDefaultTip.hover.description"),
                  })}
                  onSubmitText={t("trips.editTrip.submit")}
                  onSubmit={updateButtonClick}
                  onCancel={tripCancel}
                  t={t}
                />
                {/* <div className="row center">
              <div>
                <Button color={isButtonDisabled ? 'disabled' : 'primary'} style={{ marginRight: '1rem' }} text="Update My Trip" disabled={isButtonDisabled} onClick={updateButtonClick} />
                <Button color="primary" text="Cancel" onClick={tripCancel} />
              </div>
            </div> */}
                {showWarningMessage === 1 ? (
                  <Notification
                    type="warning"
                    positionX="center"
                    positionY="top"
                    title={t("trips.createNewTrip.warning.title")}
                    message={t("trips.createNewTrip.warning.message")}
                    onClose={() => {
                      setShowWarningMessage(2);
                    }}
                    closeMs={3500}
                  />
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default UpdateTripPage;
