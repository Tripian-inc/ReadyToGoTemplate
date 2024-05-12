import React, { useEffect, useMemo, useState } from "react";
import { providers } from "@tripian/core";
import Model, { Providers } from "@tripian/model";
import useBbTours from "../../../hooks/useBbTours";
import moment from "moment";
import { googleAnalyticsDimension } from "../../../gtag";
import { PreLoading, BbTourInfoImage, BbTourInfoOffer, BbTourInfoForm, BbTourInfoText, BackButton } from "@tripian/react";
import classes from "./BbTourInfo.module.scss";
import AppNav from "../../../App/AppNav/AppNav";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import { useHistory } from "react-router";

interface IBbTourInfo {
  tourId: number;
  startDate?: string;
  endDate?: string;
  adults?: string;
  children?: string;
  t: (value: Model.TranslationKey) => string;
}

const BbTourInfo: React.FC<IBbTourInfo> = ({ tourId, startDate, endDate, adults, children, t }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Providers.Bb.Product>();
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment(startDate));
  const [BbUrl, setBbUrl] = useState<string>();
  const [adultCount, setAdultCount] = useState(Number(adults || 0));
  const [childrenCount, setChildrenCount] = useState(Number(children || 0));

  const { fetchTourInfo, bbActivityInfo, loadingBbTourInfo } = useBbTours();

  const history = useHistory();

  useEffect(() => {
    if (providers.bb) {
      if (startDate && endDate) {
        providers.bb.searchActivity(selectedDate.format("YYYY-MM-DD").toString(), endDate, tourId).then((data) => {
          setProduct(data.products[0]);
          fetchTourInfo(data.products[0].offers[0].offerKey);
          setLoading(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedSelectedDateOffers = useMemo(() => {
    const selectedDateOffers = product?.offers.filter((pd) => pd.available && pd.date === selectedDate.format("YYYY-MM-DD"));
    selectedDateOffers?.sort((a, b) => Number(a.startTimes[0].replace(":", "")) - Number(b.startTimes[0].replace(":", "")));
    return selectedDateOffers;
  }, [product?.offers, selectedDate]);

  const minPrice = useMemo(() => {
    if (orderedSelectedDateOffers === undefined || orderedSelectedDateOffers.length === 0) return "";

    const amount: number = orderedSelectedDateOffers[0].priceBreakDowns.find((pb) => pb.touristType === "ADULT")?.price.amount ?? 0;
    if (amount === 0) {
      return `$${orderedSelectedDateOffers[0].priceBreakDowns[0].price.amount} per tour`;
    }
    return `$${amount} ${t("trips.myTrips.localExperiences.tourDetails.experience.perPerson")}`;
  }, [orderedSelectedDateOffers, t]);

  const offerList = useMemo(() => {
    if (orderedSelectedDateOffers && orderedSelectedDateOffers.length > 0 && startDate && endDate && product) {
      return (
        <div>
          <h4 className="center mb2">{t("trips.myTrips.localExperiences.tourDetails.experience.availableOffers")}</h4>
          {orderedSelectedDateOffers.map((off, index) => {
            return (
              <BbTourInfoOffer
                key={`${off.offerKey}-${index}`}
                defaultChecked={index === 0}
                minPrice={minPrice}
                numberOfAdults={adultCount}
                numberOfChildren={childrenCount}
                offer={off}
                onBookNow={(bbUrl) => {
                  setBbUrl(bbUrl);
                  window.open(bbUrl);
                }}
                productId={product?.info.id}
              />
            );
          })}
        </div>
      );
    }

    return null;
  }, [adultCount, childrenCount, endDate, minPrice, orderedSelectedDateOffers, product, startDate, t]);

  useEffect(() => {
    if (BbUrl) {
      googleAnalyticsDimension("viewedProductUrl", BbUrl);
    }
  }, [BbUrl]);

  const durationFormat = (duration: number) => {
    const hours = duration / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);

    return `${rhours} Hour${rhours > 1 ? "s" : ""} ${rminutes > 0 ? `, ${rminutes} Mins` : ""}`;
  };

  if (loading || loadingBbTourInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (bbActivityInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">
          {t("trips.myTrips.localExperiences.tourDetails.experience.doesNotSupport")} "Bookbarbados" {t("trips.myTrips.localExperiences.tourDetails.experience.tours")}.
        </div>
      </>
    );
  }
  return (
    <div className={classes.tourInfo}>
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
      <div className="row mb0 mt-4">
        <div className="col col12">
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

          <h1>{bbActivityInfo.name}</h1>
        </div>

        <div className="col col12">
          <BbTourInfoImage images={bbActivityInfo.images} />
        </div>
        <div className="row">
          <div className="col col12">{bbActivityInfo.shortDescription}</div>
        </div>

        <div className="row mb0">
          <div className="col col12">
            <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.title")}</h2>
            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.aboutThisActivity.duration")}</h4>
              </div>
              <div className="col col12 col10-m">
                <span>{`${durationFormat(bbActivityInfo.duration)}`}</span>
              </div>
            </div>

            <div className="row mb2">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.departures")}</h4>
              </div>
              <div className="col col12 col10-m">
                {bbActivityInfo.departures.map((dp) => (
                  <div key={`highlight-${Math.random()}`}>
                    <span>{dp.point}</span>
                    <br />
                  </div>
                ))}
              </div>
            </div>

            <div className="row mb0">
              <div className="col col12 col2-m">
                <h4>{t("trips.myTrips.localExperiences.tourDetails.experience.destinations")}</h4>
              </div>
              <div className="col col12 col10-m">
                {bbActivityInfo.destinations.map((dp) => (
                  <div key={`highlight-${Math.random()}`}>
                    <span>{dp.point}</span>
                    <br />
                  </div>
                ))}
              </div>{" "}
            </div>
          </div>
        </div>
        <div className="row mb0">
          <div className="col col12">
            {startDate && endDate && (
              <BbTourInfoForm
                arrivalDatetime={startDate}
                departureDatetime={endDate}
                date={selectedDate}
                showNotFoundMessage={orderedSelectedDateOffers?.length === 0}
                onChangeDate={(date) => {
                  setSelectedDate(date);
                }}
                onChangeNumberOfAdults={(adult: number) => setAdultCount(adult)}
                onChangeNumberOfChildren={(children: number) => setChildrenCount(children)}
                numberOfAdults={adultCount}
                numberOfChildren={childrenCount}
              />
            )}
          </div>
          <div className="col col12 col6-m">{offerList}</div>
        </div>
      </div>
      <div className="row mb0">
        <div className="col col12">
          <h2 className="pb8">{t("trips.myTrips.localExperiences.tourDetails.experience.title")}</h2>
          <BbTourInfoText activityInfo={bbActivityInfo} />
        </div>
      </div>
    </div>
  );
};

export default BbTourInfo;
