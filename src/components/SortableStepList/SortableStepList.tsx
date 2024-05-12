import React from "react";
import Model, { helper } from "@tripian/model";
import { DirectionInfo, RouteResult, SvgIcons } from "@tripian/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import DefaultStepCard from "../DefaultStepCard/DefaultStepCard";
import IStepAlternatives from "../../models/IStepAlternatives";

interface ISortableStepList {
  steps: Array<Model.Step>;
  focusStep: (step: Model.Step) => void;
  alternatives: IStepAlternatives[];
  alternativeDayNumbers: (alternativePois: Model.Poi[]) => number[][];
  alternativesStepId?: number;
  showAlternativesChange: (stepId: number, show: boolean) => void;
  alternativePoiCardClicked: (stepId: number, alternativePoi: Model.Poi) => void;
  alternativeReplace: (stepId: number, alternativePoi: Model.Poi) => void;
  // thumbs?: number;
  memoizedThumbs: (step?: Model.Step) => number;
  thumbsClicked: (step: Model.Step, like: number) => void;
  timesClicked: (stepId: number, from: string, to: string) => void;
  // thumbsLoading?: boolean;
  loadingReactionStep: (stepId: number) => boolean;
  userReactionUndo: (step: Model.Step) => void;
  userReactionRemoveStep: (stepId: number) => void;
  legs: RouteResult.ILeg[];
  legsOffset: number;
  bookaride?: () => void;
  callbackSortableStepList: (sortedList: Array<number>) => void;
  t: (value: Model.TranslationKey) => string;
  /* readOnlyTrip: boolean; */
}

const SortableStepList: React.FC<ISortableStepList> = ({
  steps,
  focusStep,
  alternatives,
  alternativeDayNumbers,
  alternativesStepId,
  showAlternativesChange,
  alternativePoiCardClicked,
  alternativeReplace,
  // thumbs,
  memoizedThumbs,
  thumbsClicked,
  timesClicked,
  // thumbsLoading,
  loadingReactionStep,
  userReactionUndo,
  userReactionRemoveStep,
  legs,
  legsOffset,
  bookaride,
  callbackSortableStepList,
  t,
  /* readOnlyTrip, */
}) => {
  const onDragEnd = (result: DropResult) => {
    const { destination, source /* , draggableId */ } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStepList = helper.deepCopy(steps);
    newStepList.splice(source.index, 1);
    newStepList.splice(destination.index, 0, steps[source.index]);

    const isSameArray = steps.every((s, index) => s.order === newStepList[index].order);
    if (!isSameArray) {
      callbackSortableStepList(newStepList.map((ns) => ns.id));
    } else {
      callbackSortableStepList([]);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"my-dropple-1"}>
        {(provided1) => (
          <ul className="p-0 m-0" ref={provided1.innerRef} {...provided1.droppableProps}>
            {steps.map((step, stepIndex) => {
              const stepAltertives = alternatives?.find((a) => a.stepId === step.id);
              const alternativePois = stepAltertives ? stepAltertives.pois : [];
              const alternativePoisDays: number[][] = alternativeDayNumbers(alternativePois);

              return (
                <Draggable /* isDragDisabled={readOnlyTrip === true} */ key={step.id.toString()} draggableId={step.id.toString()} index={stepIndex}>
                  {(provided2) => (
                    <li ref={provided2.innerRef} {...provided2.draggableProps} className="list-none z-50">
                      <div key={step.id}>
                        <div className={`flex pr-2`}>
                          <div className="translate-y-16" {...provided2.dragHandleProps}>
                            <SvgIcons.DragDrop size="1rem" className="md:mr-2" />
                          </div>

                          <DefaultStepCard
                            key={step.id}
                            step={step}
                            clicked={focusStep}
                            alternativePois={alternativePois}
                            alternativePoisDays={alternativePoisDays}
                            showAlternatives={alternativesStepId === step.id}
                            showAlternativesChange={showAlternativesChange}
                            alternativePoiCardClicked={(alternativePoi: Model.Poi) => alternativePoiCardClicked(step.id, alternativePoi)}
                            alternativeReplace={(alternativePoi: Model.Poi) => alternativeReplace(step.id, alternativePoi)}
                            thumbs={memoizedThumbs(step)}
                            thumbsClicked={(like: number) => thumbsClicked(step, like)}
                            timesClicked={(from, to) => timesClicked(step.id, from, to)}
                            thumbsLoading={loadingReactionStep(step.id)}
                            userReactionUndo={() => userReactionUndo(step)}
                            userReactionRemoveStep={() => userReactionRemoveStep(step.id)}
                            t={t}
                          />
                        </div>
                        {legs[stepIndex + legsOffset] ? (
                          <div className="ml-6 py-4">
                            <DirectionInfo
                              distance={legs[stepIndex + legsOffset].distance.text}
                              direction={legs[stepIndex + legsOffset].duration.text}
                              travel={legs[stepIndex + legsOffset].travel}
                              bookaride={bookaride}
                              hideBookaRide={!window.tconfig.SHOW_BOOK_A_RIDE}
                              t={t}
                            />
                          </div>
                        ) : null}
                      </div>
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided1.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SortableStepList;
