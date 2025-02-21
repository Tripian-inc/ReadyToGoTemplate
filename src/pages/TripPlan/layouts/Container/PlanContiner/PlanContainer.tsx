/* eslint-disable react/require-default-props */

import React, { useState } from "react";
import Model from "@tripian/model";
import Itineraries from "../../../components/Itineraries/Itineraries";
import CustomPoiModal from "../../../../../components/CustomPoiModal/CustomPoiModal";
import classes from "./PlanContainer.module.scss";

interface IPlanContainer {
  planDayIndex: number;
  changePlanDayIndex: (newPlanDayIndex: number) => void;
  show: boolean;
  alternativesStepId?: number;
  setAlternativesStepId: (stepId?: number) => void;
  showExplorePlaces: () => void;
  showLocalExperiences: () => void;
  selectedPoiCategoryGroup: (poiCategoryGroup: Model.PoiCategoryGroup) => void;
  selectedPoiCategoryIds: number[];
  poiCategoryGroups: Model.PoiCategoryGroup[];
  gygTourIds: number[];
  bbTourIds: number[];
  viatorTourIds: string[];
  toristyTourIds: string[];
  toursLoading: boolean;
}

const PlanContainer: React.FC<IPlanContainer> = ({
  planDayIndex,
  changePlanDayIndex,
  show,
  alternativesStepId,
  setAlternativesStepId,
  showExplorePlaces,
  showLocalExperiences,
  selectedPoiCategoryGroup,
  selectedPoiCategoryIds,
  poiCategoryGroups,
  gygTourIds,
  bbTourIds,
  viatorTourIds,
  toristyTourIds,
  toursLoading,
}) => {
  const [showCustomPoiModal, setShowCustomPoiModal] = useState<boolean>(false);

  const planContainerClasses = [classes.planContainer];
  if (!window.tconfig.SHOW_OVERVIEW) planContainerClasses.push("container-height");
  else planContainerClasses.push("container-height-tab");
  if (show) planContainerClasses.push(classes.planContainerOpen);
  else planContainerClasses.push(classes.planContainerClose);

  return (
    <>
      <div className={planContainerClasses.join(" ")}>
        <Itineraries
          alternativesStepId={alternativesStepId}
          setAlternativesStepId={setAlternativesStepId}
          planDayIndex={planDayIndex}
          changePlanDayIndex={changePlanDayIndex}
          showExplorePlaces={showExplorePlaces}
          showLocalExperiences={showLocalExperiences}
          selectedPoiCategoryGroup={selectedPoiCategoryGroup}
          customPoiModalShow={() => setShowCustomPoiModal(!showCustomPoiModal)}
          poiCategoryGroups={poiCategoryGroups}
          selectedPoiCategoryIds={selectedPoiCategoryIds}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          toursLoading={toursLoading}
        />
      </div>
      {/* {tripReference && plan && ( */}
      <CustomPoiModal
        showModal={showCustomPoiModal}
        setShowModal={() => setShowCustomPoiModal(!showCustomPoiModal)}
        planDayIndex={planDayIndex}
        // planId={plan?.id}
        // cityBoundary={tripReference.city.boundary}
        // cityCoordinate={tripReference?.city.coordinate}
        // t={t}
      />
      {/* )} */}
    </>
  );
};

export default PlanContainer;
