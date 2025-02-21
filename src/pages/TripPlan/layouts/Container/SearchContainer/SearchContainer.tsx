import React, { useCallback, useEffect, useMemo, useState } from "react";

import Model, { helper } from "@tripian/model";
import { PoiCategories, CloseIconButton, PoiSearchAutoComplete, Badge } from "@tripian/react";

import SearchPlace from "../../../../../components/SearchPlace/SearchPlace";

import IStepAlternatives from "../../../../../models/IStepAlternatives";

import useStep from "../../../../../hooks/useStep";
import useSearchPoi from "../../../../../hooks/useSearchPoi";
import useFocus from "../../../../../hooks/useFocus";
import classes from "./SearchContainer.module.scss";
import { CloneModal } from "../../../../../components/CloneModal/CloneModal";

// const attractionsCategoryIds = [1, 28, 30, 32, 26, 29, 25, 49];
// const restaurantsCategoryIds = [3];
// const cafesCategoryIds = [24, 36, 33];
// const nightlifesCategoryIds = [4, 31, 35];
// const shoppingsCategoryIds = [34, 50, 51, 52, 53, 54];

interface PlanIdStepDay {
  planId: number;
  step: Model.Step;
  dayIndex: number;
}

interface ISearchContainer {
  poiCategoryGroups: Model.PoiCategoryGroup[];
  show: boolean;
  close: () => void;
  // poiCategories: Model.PoiCategory[];
  dayIndex: number;
  tripHash: string;
  tripReadOnly: boolean;
  plans: Model.Plan[];
  alternatives: IStepAlternatives[];
  selectedPoiCategoryGroups: Model.PoiCategoryGroup[];
  setSelectedPoiCategoryGroups: (newPoiCategoryGroups: Model.PoiCategoryGroup[]) => void;
  gygTourIds: number[];
  bbTourIds: number[];
  viatorTourIds: string[];
  toristyTourIds: string[];
  toursLoading: boolean;
  t: (value: Model.TranslationKey) => string;
}

const SearchContainer: React.FC<ISearchContainer> = ({
  poiCategoryGroups,
  show,
  close,
  dayIndex,
  tripHash,
  tripReadOnly,
  plans,
  alternatives,
  selectedPoiCategoryGroups,
  setSelectedPoiCategoryGroups,
  gygTourIds,
  bbTourIds,
  viatorTourIds,
  toristyTourIds,
  toursLoading,
  t,
}) => {
  // const [query, setQuery] = useState<string>("");
  const [poiCategoryOptions, setPoiCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
  const [poiCategorySearchText, setPoiCategorySearchText] = useState<string>("");

  // const { tripReference } = useTrip();
  const { focusPoi, focusStep } = useFocus();
  const { openSearchPoi, searchPoiAutoCompleteTags } = useSearchPoi();
  const { stepAdd, stepDelete } = useStep();

  const selectedPoiCategoryIds = useMemo(() => {
    const allIds: number[] = [];

    const selectedCategoryGroups = selectedPoiCategoryGroups.map((categoryGroup) => {
      const result: Model.CategoryGroupResult = {
        ids: categoryGroup.categories.map((category: Model.PoiCategory) => category.id),
        group: categoryGroup.name,
      };
      return result;
    });

    selectedCategoryGroups.forEach((group) => {
      allIds.push(...group.ids);
    });
    return allIds;
  }, [selectedPoiCategoryGroups]);

  // useEffect(() => {
  //   searchPoiAutoComplete().then((tagList: string[]) => {
  //     const options = tagList.map((tag) => ({ value: tag, label: tag }));
  //     setPoiCategoryOptions(options);
  //   });
  // }, [searchPoiAutoComplete]);

  useEffect(() => {
    if (selectedPoiCategoryIds && selectedPoiCategoryIds.length > 0) {
      searchPoiAutoCompleteTags(selectedPoiCategoryIds).then((tagList: { id: number; name: string }[]) => {
        const options = tagList.map((tag) => ({ value: tag.name, label: tag.name }));
        setPoiCategoryOptions(options);
      });
    }
  }, [searchPoiAutoCompleteTags, selectedPoiCategoryIds]);

  // const hasMustTry: boolean = tripReference !== undefined && tripReference.city.mustTries.length > 0;

  const currentPlanId = useMemo(() => (dayIndex < plans.length ? plans[dayIndex].id : 0), [dayIndex, plans]);

  const planStepDays: PlanIdStepDay[] = useMemo(() => {
    let steps: PlanIdStepDay[] = [];

    steps = plans.reduce((previousValue: PlanIdStepDay[], currentValue: Model.Plan, currentIndex: number) => {
      if (currentValue) {
        const currentSteps: PlanIdStepDay[] = currentValue.steps.map((step) => ({
          planId: currentValue.id,
          step,
          dayIndex: currentIndex,
        }));

        return previousValue.concat(currentSteps);
      }

      return previousValue;
    }, []);

    return steps;
  }, [plans]);

  const planAlternatives = useMemo(() => {
    const alternativePois = alternatives.reduce((previousValue: Model.Poi[], currentValue: IStepAlternatives) => previousValue.concat(currentValue.pois), []);

    const excludedEmpties = alternativePois.filter((alternativePoi) => alternativePoi);

    return helper.removeDuplicateValuesById<Model.Poi>(excludedEmpties);
  }, [alternatives]);

  const poiPlanStepDay = useCallback(
    (poiId: string): PlanIdStepDay | undefined => planStepDays.find((memoizedStep) => memoizedStep.step.poi.id === poiId && memoizedStep.dayIndex === dayIndex),
    [dayIndex, planStepDays]
  );

  const isCurrentDayStep = useCallback((poiId: string): boolean => !!poiPlanStepDay(poiId), [poiPlanStepDay]);

  // for step poi dayIndexes like [0,1,2,...]
  // for alternative poi [-1]
  // not recommended poi [-2]
  const poiDayIndexes = useCallback(
    (poiId: string) => {
      const poisSteps: PlanIdStepDay[] = planStepDays.filter((memoizedStep: PlanIdStepDay) => memoizedStep.step.poi.id === poiId);

      // Multi plan poi part of day indexes
      if (poisSteps.length > 0) return poisSteps.map((poisStep) => poisStep.dayIndex); // for step poi dayIndexes like [0,1,2,...]

      // Only a plan part of day index
      return [planAlternatives.findIndex((alternativePoi) => alternativePoi.id === poiId) > -1 ? -1 : -2];
    },
    [planAlternatives, planStepDays]
  );

  const memoizedList = useCallback(
    (categoryIdsList: number[]) => {
      const recommendedCurrentCategorySteps: {
        planId: number;
        step: Model.Step;
        dayIndex: number;
      }[] = planStepDays.filter((memoizedStep) => categoryIdsList.includes(memoizedStep.step.poi.category[0].id));

      const recommendedCurrentCategoryStepPoisThisDay: Model.Poi[] = recommendedCurrentCategorySteps
        .filter((rs) => rs.dayIndex === dayIndex)
        .map((recommendedCurrentCategoryStep: { planId: number; step: Model.Step; dayIndex: number }) => recommendedCurrentCategoryStep.step.poi);

      const recommendedCurrentCategoryStepPoisOtherDays: Model.Poi[] = recommendedCurrentCategorySteps
        .filter((rs) => rs.dayIndex !== dayIndex)
        .map((recommendedCurrentCategoryStep: { planId: number; step: Model.Step; dayIndex: number }) => recommendedCurrentCategoryStep.step.poi);

      const recommendedCurrentCategoryAlternatives: Model.Poi[] = planAlternatives.filter((memoizedAlternative) => categoryIdsList.includes(memoizedAlternative.category[0].id));

      const resultList: Model.Poi[] = [...recommendedCurrentCategoryStepPoisThisDay, ...recommendedCurrentCategoryStepPoisOtherDays, ...recommendedCurrentCategoryAlternatives];

      return helper.removeDuplicateValuesById<Model.Poi>(resultList);
    },
    [dayIndex, planAlternatives, planStepDays]
  );

  const searchContainerClasses = [classes.searchContainer];
  if (!window.tconfig.SHOW_OVERVIEW) searchContainerClasses.push("container-height");
  else searchContainerClasses.push("container-height-tab");
  if (show) searchContainerClasses.push(classes.searchContainerOpen);
  else searchContainerClasses.push(classes.searchContainerClose);

  const cardButtonOnClick = useCallback(
    (poi: Model.Poi, from?: string, to?: string) => {
      const planStepDay = poiPlanStepDay(poi.id);
      if (tripReadOnly) {
        setShowCloneModal(true);
      } else if (planStepDay) {
        stepDelete(planStepDay.step.id);
      } else {
        stepAdd(currentPlanId, poi.id, from, to);
      }
    },
    [currentPlanId, poiPlanStepDay, stepAdd, stepDelete, tripReadOnly]
  );

  const focus = useCallback(
    (poi: Model.Poi) => {
      const planStepDay = poiPlanStepDay(poi.id);
      if (planStepDay) focusStep(planStepDay.step);
      else focusPoi(poi);
    },
    [focusPoi, focusStep, poiPlanStepDay]
  );

  return (
    <div className={searchContainerClasses.join(" ")}>
      <div className="scrollable-y" style={{ height: "100%" }}>
        <div className={`${classes.searchBoxClose} mt3 pl3`} style={{ display: "flex" }}>
          <div className={`${classes.searchCloseIcon} m3`}>
            <CloseIconButton
              fill="var(--text-primary-color)"
              clicked={() => {
                setSelectedTags([]);
                close();
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 justify-between md:flex-row " style={{ width: "calc(100% - 2rem)", margin: "1rem auto" }}>
          <PoiCategories
            selectedPoiCategoryGroups={selectedPoiCategoryGroups}
            setSelectedPoiCategoryGroups={(newPoiCategoryGroups: Model.PoiCategoryGroup[]) => {
              setSelectedPoiCategoryGroups(newPoiCategoryGroups);
              if (newPoiCategoryGroups.length === 0) {
                setSelectedTags([]);
              }
            }}
            t={t}
            categoryGroups={poiCategoryGroups}
          />
          <PoiSearchAutoComplete
            options={poiCategoryOptions}
            onSelectedOptionChange={(selectedOptions) => {
              const newSelectedTags = [...selectedTags];
              selectedOptions.forEach((opt) => {
                if (!newSelectedTags.includes(opt.value)) {
                  newSelectedTags.push(opt.value);
                }
              });
              setSelectedTags(newSelectedTags);
            }}
            onCreateOption={(input) => {
              const newSelectedTags = [...selectedTags];
              if (input.length > 2) {
                if (!newSelectedTags.includes(input)) {
                  newSelectedTags.push(input);
                }
                setSelectedTags(newSelectedTags);
              }
            }}
            inputValue={poiCategorySearchText}
            onInputChange={(searchText) => setPoiCategorySearchText(searchText)}
            selectedOptionValues={selectedTags}
            placeHolder={t("trips.myTrips.exploreMore.placeholder")}
            isDisabled={selectedPoiCategoryIds.length === 0}
          />
        </div>
        <hr />

        <div className="flex items-center gap-1 w-full flex-wrap mt-4 px-4">
          {selectedTags.map((selectedTag) => (
            <Badge
              key={`selected-tag-${selectedTag}`}
              name={selectedTag}
              onClose={(name: string) => {
                const newSelectedTags = selectedTags.filter((selectedTag) => selectedTag !== name);
                setSelectedTags(newSelectedTags);
              }}
            />
          ))}
        </div>
        <div className="px4">
          <SearchPlace
            query={selectedTags}
            poiCategoryIds={selectedPoiCategoryIds}
            recommendedPois={memoizedList(selectedPoiCategoryIds)}
            search={openSearchPoi}
            focus={focus}
            cardButonOnClick={cardButtonOnClick}
            isCurrentDayStep={isCurrentDayStep}
            getDayIndexes={poiDayIndexes}
            gygTourIds={gygTourIds}
            bbTourIds={bbTourIds}
            viatorTourIds={viatorTourIds}
            toristyTourIds={toristyTourIds}
            toursLoading={toursLoading}
            t={t}
          />
        </div>
      </div>
      {showCloneModal && <CloneModal sharedTripHash={tripHash ?? ""} onCancel={() => setShowCloneModal(false)} />}
    </div>
  );
};

export default SearchContainer;
