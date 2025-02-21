import React, { useEffect } from "react";
import { BackButton, Button, PreLoading, ToristyTourInfoImage } from "@tripian/react";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { useHistory } from "react-router";
import Model from "@tripian/model";
import useToristyInfo from "../../../hooks/useToristyInfo";
import classes from "./ToristyTourInfo.module.scss";

interface IToristyTourInfo {
  cityId: number;
  tourId: string;
  t: (value: Model.TranslationKey) => string;
}

const ToristyTourInfo: React.FC<IToristyTourInfo> = ({ tourId, t }) => {
  const { fetchToristyInfo, toristyInfo, loadingToristyInfo } = useToristyInfo();

  const history = useHistory();

  useEffect(() => {
    fetchToristyInfo(tourId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingToristyInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (toristyInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">Your platform does not support "Rezdy" tours.</div>
      </>
    );
  }

  return (
    <div className={classes.tourInfo}>
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
      <div className="row mb0">
        <div className="col col12">
          <>
            {history.location.key && (
              <div className={classes.gygTourInfoBack}>
                <BackButton
                  fill="#000"
                  clicked={() => {
                    history.goBack();
                  }}
                />
              </div>
            )}
          </>
          <h1>{toristyInfo.service.name}</h1>
        </div>

        {toristyInfo.service.images && (
          <div className="col col12">
            <ToristyTourInfoImage tourImages={toristyInfo.service.images} />
          </div>
        )}

        {toristyInfo.service.description && (
          <div className="row">
            <div className="col col12" dangerouslySetInnerHTML={{ __html: toristyInfo.service.description }} />
          </div>
        )}

        <div className="row mb0">
          <div className="col col12">
            <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.title")}</h2>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.cancelation")}</h4>
              </div>
              <div className="col col12 col10-m">
                {toristyInfo.service.cancellation_text &&
                  (/<[a-z][\s\S]*>/i.test(toristyInfo.service.cancellation_text) ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: toristyInfo.service.cancellation_text,
                      }}
                    />
                  ) : (
                    <div>{toristyInfo.service.cancellation_text}</div>
                  ))}
              </div>{" "}
            </div>
          </div>
        </div>

        <div className="row mb0 px-6">
          <div className="col col12">
            <h2 className="pb8 font-bold text-base">{t("trips.myTrips.localExperiences.tourDetails.experience.title")}</h2>
            {toristyInfo.service.included && (
              <>
                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.includes")}</h4>
                  </div>
                  <div className="col col12 col10-m">
                    <div dangerouslySetInnerHTML={{ __html: toristyInfo.service.included }} />
                  </div>
                </div>
                <hr className="mb6" style={{ opacity: 0.2 }} />
              </>
            )}

            {toristyInfo.service.excluded && (
              <>
                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.excludes")}</h4>
                  </div>
                  <div className="col col12 col10-m">
                    <div dangerouslySetInnerHTML={{ __html: toristyInfo.service.excluded }} />
                  </div>
                </div>
                <hr className="mb6" style={{ opacity: 0.2 }} />
              </>
            )}

            {toristyInfo.service.attention && (
              <>
                <div className="row mb2">
                  <div className="col col12 col2-m">
                    <h4>Know before you go</h4>
                  </div>
                  <div className="col col12 col10-m">
                    <div dangerouslySetInnerHTML={{ __html: toristyInfo.service.attention }} />
                  </div>
                </div>
                <hr className="mb6" style={{ opacity: 0.2 }} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className={classes.mainDiv}>
        <div className="center">
          <Button
            color="primary"
            className={classes.addToChartButton}
            onClick={() => {
              window.open(toristyInfo.fullinformationbookinglink, "_blank");
            }}
            text="BOOK NOW"
          />
        </div>
      </div>
    </div>
  );
};

export default ToristyTourInfo;
