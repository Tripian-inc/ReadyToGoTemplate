import React, { useEffect, useMemo, useState } from "react";
import { PreAppLoading } from "@tripian/react";
import classes from "./TripLoading.module.scss";
import Model from "@tripian/model";

interface ITripLoading {
  t: (value: Model.TranslationKey) => string;
}

const TripLoading: React.FC<ITripLoading> = ({ t }) => {
  const [state, setState] = useState({ sentence: "", index: 0 });

  const sentences = useMemo(
    () => [t("trips.loading.exploring"), t("trips.loading.customizing"), t("trips.loading.handSelecting"), t("trips.loading.researching"), t("trips.loading.mapping")],
    [t]
  );

  const renderSentence = (sentence: string, index: number) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        setState({ sentence, index });
        resolve();
      }, 2000);
    });
  };

  useEffect(() => {
    sentences.reduce((promise, sentence, index) => promise.then(() => renderSentence(sentence, index)), Promise.resolve());
  }, [sentences]);

  return (
    <PreAppLoading color="var(--primary-color)">
      <span key={state.index} className={classes.loadingText}>
        {state.sentence}
      </span>
    </PreAppLoading>
  );
};

export default TripLoading;
