import React, { useEffect } from "react";
import { BackButton, Button, PreLoading, RezdyTourInfoImage } from "@tripian/react";
import useRezdyApi from "../../../hooks/useRezdyApi";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { useHistory } from "react-router";
import Model from "@tripian/model";
import classes from "./RezdyTourInfo.module.scss";

interface IRezdyTourInfo {
  cityId: number;
  tourId: string;
  t: (value: Model.TranslationKey) => string;
}

const RezdyTourInfo: React.FC<IRezdyTourInfo> = ({ cityId, tourId, t }) => {
  const { fetchProductInfo, rezdyProductInfo, loadingRezdyProductInfo } = useRezdyApi(cityId);

  const history = useHistory();

  useEffect(() => {
    fetchProductInfo(tourId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingRezdyProductInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (rezdyProductInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">Your platform does not support "Rezdy" tours.</div>
      </>
    );
  }

  console.log("rezdyProductInfo", rezdyProductInfo);
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
          <h1>{rezdyProductInfo.name}</h1>
        </div>

        {rezdyProductInfo.images && (
          <div className="col col12">
            <RezdyTourInfoImage tourImages={rezdyProductInfo.images} />
          </div>
        )}

        {rezdyProductInfo.shortDescription && (
          <div className="row">
            <div className="col col12" dangerouslySetInnerHTML={{ __html: rezdyProductInfo.shortDescription }} />
          </div>
        )}

        <div className="row mb0">
          <div className="col col12">
            <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.title")}</h2>
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.duration")}</h4>
              </div>
              <div className="col col12 col10-m">
                <span>{rezdyProductInfo.durationMinutes} mins</span>
              </div>
            </div>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.cancelation")}</h4>
              </div>
              <div className="col col12 col10-m">{rezdyProductInfo.cancellationPolicyDays} days</div>
            </div>
          </div>
        </div>

        {rezdyProductInfo.description && (
          <div className="row mb2">
            <div className="col col12 col2-m">
              <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.fullDescription")}</h4>
            </div>
            <div className="col col12 col10-m">
              <div dangerouslySetInnerHTML={{ __html: rezdyProductInfo.description }} />
            </div>
          </div>
        )}
      </div>

      <div className={classes.mainDiv}>
        <div className="center">
          <Button
            color="primary"
            className={classes.addToChartButton}
            onClick={() => {
              const bookingWidgetUrl = `https://365adventures.rezdy.com/calendarWidget/${rezdyProductInfo.productCode}`;
              window.open(bookingWidgetUrl);
            }}
            text="BOOK NOW"
          />
        </div>
      </div>
    </div>
  );
};

export default RezdyTourInfo;
