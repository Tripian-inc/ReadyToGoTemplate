/* eslint-disable react/require-default-props */

import React from "react";
import Model from "@tripian/model";
import { StepCard, StepCardUserReaction } from "@tripian/react";

interface IDefaultStepCard {
  step: Model.Step;
  clicked: (step: Model.Step) => void;
  alternativePois: Model.Poi[];
  alternativePoisDays: number[][];
  alternativePoiCardClicked: (alternativePoi: Model.Poi) => void;
  alternativeReplace: (alternativePoi: Model.Poi) => void;
  showAlternativesChange: (stepId: number, show: boolean) => void;
  showAlternatives?: boolean;
  showRemoveReplaceButtons?: boolean;
  hideScore?: boolean;
  hideStepsTime?: boolean;
  hideFeatures?: boolean;
  hideCuisine?: boolean;
  isWidget?: boolean;
  // user reaction
  thumbs?: number;
  thumbsLoading?: boolean;
  thumbsClicked?: (like: number) => void;
  timesClicked: (from: string, to: string) => void;
  userReactionUndo?: () => void;
  userReactionRemoveStep?: () => void;
  gygTourIds: number[];
  bbTourIds: number[];
  viatorTourIds: string[];
  toristyTourIds: string[];
  toursLoading: boolean;
  t: (value: Model.TranslationKey) => string;
  // userReactionComment?: (comment: Model.REACTION_COMMENT) => void;
}

const DefaultStepCard: React.FC<IDefaultStepCard> = ({
  step,
  clicked,
  alternativePois,
  alternativePoisDays,
  alternativePoiCardClicked,
  alternativeReplace,
  showAlternativesChange,
  showAlternatives,
  showRemoveReplaceButtons,
  hideScore,
  hideStepsTime,
  hideFeatures,
  hideCuisine,
  isWidget,
  // user reaction
  thumbs = -1,
  thumbsLoading,
  thumbsClicked = (like: number) => {
    // eslint-disable-next-line no-console
    console.warn("StepCardUserReaction with undefined thumbsClicked", like);
  },
  timesClicked,
  userReactionUndo = () => {
    // eslint-disable-next-line no-console
    console.warn("StepCardUserReaction with undefined userReactionUndo");
  },
  userReactionRemoveStep = () => {
    // eslint-disable-next-line no-console
    console.warn("StepCardUserReaction with undefined userReactionRemoveStep");
  },
  gygTourIds,
  bbTourIds,
  viatorTourIds,
  toristyTourIds,
  toursLoading,
  t,
  // userReactionComment = (comment: Model.REACTION_COMMENT) => {
  //   console.log('StepCardUserReaction with undefined userReactionComment', comment);
  // },
}) => {
  if (window.tconfig.SHOW_STEP_CARD_THUMBS && !isNaN(parseFloat(step.poi.id)))
    return (
      <StepCardUserReaction
        key={step.id}
        step={step}
        clicked={clicked}
        alternativePois={alternativePois}
        alternativePoisDays={alternativePoisDays}
        showAlternatives={showAlternatives}
        showAlternativesChange={showAlternativesChange}
        alternativePoiCardClicked={alternativePoiCardClicked}
        alternativeReplace={alternativeReplace}
        thumbs={thumbs}
        thumbsLoading={thumbsLoading || false}
        thumbsClicked={thumbsClicked}
        timesClicked={timesClicked}
        userReactionUndo={userReactionUndo}
        userReactionRemoveStep={userReactionRemoveStep}
        showRemoveReplaceButtons={showRemoveReplaceButtons}
        hideScore={hideScore}
        hideStepsTime={hideStepsTime}
        hideFeatures={hideFeatures}
        hideCuisine={hideCuisine}
        isWidget={isWidget}
        // userReactionComment={userReactionComment}
        hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
        hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
        hideOfferIcon={!window.tconfig.SHOW_OFFERS}
        TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
        TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
        RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
        gygTourIds={gygTourIds}
        bbTourIds={bbTourIds}
        viatorTourIds={viatorTourIds}
        toristyTourIds={toristyTourIds}
        tourTicketProductsLoading={toursLoading}
        t={t}
      />
    );

  return (
    <StepCard
      key={step.id}
      step={step}
      clicked={clicked}
      alternativePois={alternativePois}
      alternativePoisDays={alternativePoisDays}
      showAlternatives={showAlternatives}
      showAlternativesChange={showAlternativesChange}
      alternativePoiCardClicked={alternativePoiCardClicked}
      alternativeReplace={alternativeReplace}
      timesClicked={timesClicked}
      hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
      hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
      hideOfferIcon={!window.tconfig.SHOW_OFFERS}
      TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
      TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
      RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
      hideScore={hideScore}
      hideStepsTime={hideStepsTime}
      hideFeatures={hideFeatures}
      hideCuisine={hideCuisine}
      isWidget={isWidget}
      gygTourIds={gygTourIds}
      bbTourIds={bbTourIds}
      viatorTourIds={viatorTourIds}
      toristyTourIds={toristyTourIds}
      tourTicketProductsLoading={toursLoading}
      t={t}
    />
  );
};

export default DefaultStepCard;
