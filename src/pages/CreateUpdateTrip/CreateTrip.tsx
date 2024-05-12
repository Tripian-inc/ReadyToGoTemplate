import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";

import Model, { helper } from "@tripian/model";
import { PreLoading, Notification, FormTemplateTripNext } from "@tripian/react";

import * as gtag from "../../gtag";
import { CREATE_TRIP, USE_TRIP_URL, OVERVIEW, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";

import useTripForm from "../../hooks/useTripForm";
import useUser from "../../hooks/useUser";
import useCompanion from "../../hooks/useCompanion";
import useTrip from "../../hooks/useTrip";
import useTranslate from "../../hooks/useTranslate";
import AppNav from "../../App/AppNav/AppNav";
import { destinationTips, questionDefaultTip, travelerInfoTips, stepHeaders } from "../../config/tripFormContents";
import TripLoading from "../../components/TripLoading/TripLoading";
import classes from "./CreateUpdateTrip.module.scss";

const emptyTripProfile: Model.TripProfile = {
  cityId: 0,
  arrivalDatetime: moment(new Date()).add(1, "days").set({ hour: 9, minute: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]"),
  departureDatetime: moment(new Date()).add(4, "days").set({ hour: 18, minute: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]"),
  answers: [],
  numberOfAdults: 1,
  // numberOfChildren: null,
  // pace: Model.TRIP_PROFILE_PACE.PACKED,
  // accommodation: null,
  companionIds: [],
  // owner: "",
  doNotGenerate: 0,
  excludeHash: [],
};

//  const someStyle: React.CSSProperties = { textAlign: 'center', margin: 30 };

const CreateTripPage = () => {
  const { loadingCities, loadingQuestionsTrip, loadingQuestionsCompanion, cities, questionsTrip, questionsCompanion } = useTripForm();
  const [tripProfile, setTripProfile] = useState<Model.TripProfile>({ ...emptyTripProfile, cityId: window.tconfig.DEFAULT_DESTINATION_ID ?? 0 });
  const [showWarningMessage, setShowWarningMessage] = useState<number>(0);

  const { t } = useTranslate();

  const { user } = useUser();
  const { tripFetchCallback } = useTrip();
  const { companions, companionAdd, loadingCompanions } = useCompanion();
  const { tripAdd, loadingTripAdd, tripClear } = useTrip();

  document.title = CREATE_TRIP.TITLE(t("trips.createNewTrip.header"));

  const history = useHistory();

  useEffect(() => {
    const redirectToUseTripUrl = () => {
      history.replace(USE_TRIP_URL.PATH);
    };

    if (!window.tconfig.SHOW_CREATE_TRIP && window.tconfig.LOGIN_WITH_HASH) {
      redirectToUseTripUrl();
    }
  }, [history]);

  useEffect(() => {
    if (user) {
      const userEmptyTripProfile = { ...emptyTripProfile, cityId: window.tconfig.DEFAULT_DESTINATION_ID ?? 0, answers: [...emptyTripProfile.answers].concat(user.answers || []) };
      setTripProfile(userEmptyTripProfile);
    }
  }, [user]);

  useEffect(() => {
    tripClear();
  }, [tripClear]);

  const checkWarning = (tripProfileParam: Model.TripProfile) => {
    if (showWarningMessage === 0) {
      if (tripProfileParam.companionIds.length > tripProfileParam.numberOfAdults + (tripProfileParam.numberOfChildren || 0) - 1) {
        setShowWarningMessage(1);
      }
    }
  };

  const callbackTripProfile = (tripProfileParam: Model.TripProfile) => {
    setTripProfile(tripProfileParam);
    checkWarning(tripProfileParam);
  };

  const onTripAdd = () => {
    if (tripProfile) {
      tripAdd(tripProfile, 0).then((trip: Model.Trip) => {
        tripFetchCallback(trip);
        gtag.googleAnalyticsEvent("CreateTrip", { trip_hash: trip.tripHash });
        if (!window.tconfig.SHOW_OVERVIEW) history.push(`${TRIP_PLAN.PATH}/${trip.tripHash}`);
        else history.push(`${OVERVIEW.PATH}/${trip.tripHash}`);
      });
    }
  };

  const tripCancel = () => {
    history.goBack();
  };

  const callbackUserCompanionAdd = async (companion: Model.Companion) => {
    companionAdd(companion as Model.CompanionRequest).then((companionAddResponse: Model.Companion[]) => {
      const companionIds = companions?.map((c) => c.id);
      const companionId = companionAddResponse.find((c) => !companionIds?.includes(c.id))?.id;
      const newTripProfile = helper.deepCopy(tripProfile);
      if (companionId) {
        newTripProfile.companionIds.push(companionId);
        setTripProfile(newTripProfile);
      }
    });
  };

  // const isButtonDisabled = !tripProfile.cityId || moment(tripProfile.arrivalDatetime).utcOffset(0) < moment().utcOffset(0);

  if (loadingCities || loadingQuestionsTrip || loadingQuestionsCompanion || loadingCompanions || questionsTrip === undefined)
    return (
      <>
        <AppNav header={CREATE_TRIP.HEADER?.(t("trips.createNewTrip.header"))} />
        <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />;
      </>
    );

  return (
    <>
      <AppNav header={CREATE_TRIP.HEADER?.(t("trips.createNewTrip.header"))} />
      <div className="background" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
        {loadingTripAdd ? (
          <div className={classes.createUpdateTripLoading}>
            <TripLoading t={t} />
          </div>
        ) : (
          <>
            {tripProfile ? (
              <div className={classes.formTemplateTripNextContainer}>
                <FormTemplateTripNext
                  cities={cities || []}
                  tripProfile={tripProfile}
                  tripQuestions={questionsTrip}
                  callbackTripProfile={callbackTripProfile}
                  userCompanionQuestions={questionsCompanion || []}
                  companionLoadingList={[]}
                  callbackUserCompanionAdd={callbackUserCompanionAdd}
                  userCompanions={companions}
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
                  onSubmitText={t("trips.createNewTrip.form.submit")}
                  onSubmit={onTripAdd}
                  onCancel={tripCancel}
                  t={t}
                />
                {/* <div className="row center">
              <div>
                <Button color={isButtonDisabled ? 'disabled' : 'primary'} style={{ marginRight: '1rem' }} text="Create My Trip" disabled={isButtonDisabled} onClick={onTripAdd} />
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

export default CreateTripPage;
