import React, { useEffect, useMemo } from "react";
import { googleAnalyticsDimension } from "../../../gtag";
import { BackButton, Button, PreLoading, RatingStars, ViatorTourInfoImage } from "@tripian/react";
import useViatorApi from "../../../hooks/useViatorApi";
import classes from "./ViatorTourInfo.module.scss";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { useHistory } from "react-router";
import useTranslate from "../../../hooks/useTranslate";

interface IViatorTourInfo {
  tourId: string;
}

const ViatorTourInfo: React.FC<IViatorTourInfo> = ({ tourId }) => {
  const { fetchProductInfo, viatorProductInfo, loadingViatorProductInfo } = useViatorApi();

  const history = useHistory();

  const { t } = useTranslate();

  useEffect(() => {
    fetchProductInfo(tourId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viatorProductInfo) {
      googleAnalyticsDimension("viewedProductUrl", viatorProductInfo.productUrl);
    }
  }, [viatorProductInfo]);

  const duration = useMemo(() => {
    if (viatorProductInfo) {
      if (viatorProductInfo.itinerary.duration.fixedDurationInMinutes) {
        return <span className={classes.numberOfRatings}>{viatorProductInfo.itinerary.duration.fixedDurationInMinutes} mins</span>;
      }
      if (viatorProductInfo.itinerary.duration.variableDurationFromMinutes && viatorProductInfo.itinerary.duration.variableDurationToMinutes) {
        return (
          <span className={classes.numberOfRatings}>
            {viatorProductInfo.itinerary.duration.variableDurationFromMinutes} - {viatorProductInfo.itinerary.duration.variableDurationToMinutes} mins
          </span>
        );
      }
    }
    return null;
  }, [viatorProductInfo]);

  if (loadingViatorProductInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (viatorProductInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">Your platform does not support "Viator" tours.</div>
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
          <h1>{viatorProductInfo.title}</h1>
          <div className={classes.gygTourInfoRatingStars}>
            <RatingStars rating={(viatorProductInfo.reviews.combinedAverageRating * 20).toString()} />
            <span className={classes.gygTourInfoOverralRating}>{viatorProductInfo.reviews.combinedAverageRating.toFixed(1)}</span>
            <span className={classes.gygTourInfoReviews}>{viatorProductInfo.reviews.totalReviews} reviews</span>
          </div>
        </div>

        <div className="col col12">
          <ViatorTourInfoImage tourImage={viatorProductInfo.images} />
        </div>
        <div className="row">
          <div className="col col12">{viatorProductInfo.description}</div>
        </div>

        <div className="row mb0">
          <div className="col col12">
            <h2 className="pb8">About this activity</h2>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>Duration</h4>
              </div>
              <div className="col col12 col10-m">
                <span>{duration}</span>
              </div>
            </div>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>Cancelation</h4>
              </div>
              <div className="col col12 col10-m">{viatorProductInfo.cancellationPolicy.description}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={classes.mainDiv}>
        <div className="center">
          <Button color="primary" className={classes.addToChartButton} onClick={() => window.open(viatorProductInfo.productUrl)} text="BOOK NOW" />
        </div>
      </div>

      <div className="row mb0">
        <div className="col col12">
          <h2 className="pb8">Experience</h2>
          {viatorProductInfo.inclusions && viatorProductInfo.inclusions.length > 0 && (
            <>
              <div className="row mb2">
                <div className="col col12 col2-m">
                  <h4>Includes</h4>
                </div>
                <div className="col col12 col10-m">
                  {viatorProductInfo.inclusions.map((inclusion) => (
                    <div key={`inclusions-${Math.random()}`}>
                      <li>{inclusion.description || inclusion.otherDescription || inclusion.typeDescription}</li>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="mb6" style={{ opacity: 0.2 }} />
            </>
          )}

          {viatorProductInfo.exclusions && viatorProductInfo.exclusions.length > 0 && (
            <>
              <div className="row mb2">
                <div className="col col12 col2-m">
                  <h4>Excludes</h4>
                </div>
                <div className="col col12 col10-m">
                  {viatorProductInfo.exclusions.map((exclusion) => (
                    <div key={`exclusions-${Math.random()}`}>
                      <li>{exclusion.description || exclusion.otherDescription || exclusion.typeDescription}</li>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="mb6" style={{ opacity: 0.2 }} />
            </>
          )}

          {viatorProductInfo.additionalInfo && (
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>Additional information</h4>
              </div>
              <div className="col col12 col10-m">
                {viatorProductInfo.additionalInfo.map((additional_info) => (
                  <div key={`additional_information-${Math.random()}`}>
                    <li>{additional_info.description}</li>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViatorTourInfo;
