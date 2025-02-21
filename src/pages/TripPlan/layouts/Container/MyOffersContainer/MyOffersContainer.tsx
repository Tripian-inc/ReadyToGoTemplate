/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unused-prop-types */

import React, { useMemo /* , { useCallback } */ } from "react";
// import { useDispatch } from 'react-redux';
import Model from "@tripian/model";
import useFocus from "../../../../../hooks/useFocus";
import { useHistory } from "react-router";
import useTranslate from "../../../../../hooks/useTranslate";
import { QR_READER, QR_WRITER } from "../../../../../constants/ROUTER_PATH_TITLE";
import { PreLoading, CloseIconButton, OfferCard } from "@tripian/react";

// import IFavoritePoi from "../../../../../models/IFavoritePoi";
// import { changeFavoritesVisible } from '../../../../../redux/action/layout';

import classes from "./MyOffersContainer.module.scss";
import moment from "moment";

interface IMyOffersContainer {
  show: boolean;
  close: () => void;
  dayIndex: number;
  plans?: Model.Plan[];
  loadingMyAllOffers: boolean;
  myAllOffers: Model.Poi[] | undefined;
  isLoadingOffer: (offerId: number) => boolean;
  offerOptIn: (offerId: number, optInDate: string) => Promise<void>;
  offerOptOut: (offerId: number) => Promise<void>;
  timezone?: string;
}

const MyOffersContainer: React.FC<IMyOffersContainer> = ({ show, close, dayIndex, plans, loadingMyAllOffers, myAllOffers, isLoadingOffer, offerOptIn, offerOptOut, timezone }) => {
  const currentPlanDate = useMemo(() => (plans && dayIndex < plans.length ? plans[dayIndex].date : undefined), [dayIndex, plans]);

  const offerContainerClasses = [classes.myOffersContainer];
  if (!window.tconfig.SHOW_OVERVIEW) offerContainerClasses.push("container-height");
  else offerContainerClasses.push("container-height-tab");
  if (show) offerContainerClasses.push(classes.myOffersContainerOpen);
  else offerContainerClasses.push(classes.myOffersContainerClose);
  if (window.tconfig.BRAND_NAME === "bookbarbados") {
    offerContainerClasses.push(classes.backgroundImage);
  }

  const { focusPoi } = useFocus();

  const { t } = useTranslate();

  const history = useHistory();

  const renderContent = () => {
    if (loadingMyAllOffers && myAllOffers === undefined) return <PreLoading />;

    if (myAllOffers) {
      if (myAllOffers.length === 0)
        return (
          <div className="center">
            <span>{t("trips.myTrips.itinerary.offers.myOffers.emptyOffersMessage")}</span>{" "}
          </div>
        );

      return myAllOffers.map((offerPoi: Model.Poi, i: number) => {
        return offerPoi.offers.map((offer: Model.Offer, index) => (
          <div className="my-2" key={index}>
            <OfferCard
              key={`my-offers-result-poi-${offer.id}`}
              offer={offer}
              planDate={currentPlanDate}
              isMyOffer={true}
              optClicked={(optIn: boolean, id: number) => {
                if (currentPlanDate) {
                  if (optIn) {
                    const baseDate = moment(currentPlanDate);
                    const currentTime = moment();
                    const dateTime = baseDate
                      .set({
                        hour: currentTime.hour(),
                        minute: currentTime.minute(),
                        second: currentTime.second(),
                      })
                      .tz(timezone || "UTC")
                      .format("YYYY-MM-DD HH:mm:ss");
                    offerOptIn(id, dateTime);
                  } else {
                    return offerOptOut(id);
                  }
                }
                // if (currentPlanDate) optIn ? offerOptIn(id, currentPlanDate) : offerOptOut(id);
              }}
              redeemClicked={() => {
                if (window.tconfig.QR_READER === "business") {
                  history.push(QR_WRITER.PATH + `/${offer.id}`);
                } else {
                  history.push(QR_READER.PATH);
                }
              }}
              cardClicked={() => focusPoi(offerPoi)}
              isLoadingOffer={isLoadingOffer}
              optedIn={myAllOffers?.some((p) => p.offers.some((x) => x.id === offer.id)) || false}
              poiName={offerPoi.name}
              redeemText={window.tconfig.QR_READER === "business" ? "View QR Code" : "Redeem"}
            />
          </div>
        ));
      });

      /* return myAllOffers.map((offerPoi: Model.Poi) =>
        isLoadingOffer(offerPoi.id) ? (
          <div className="myOffer-items-loading">
            <PreLoading key={`myOffer-poi-ref-card-${offerPoi.id}`} />
          </div>
        ) : (
          <div key={`myOffer-poi-ref-card-${offerPoi.id}`}>
            {offerPoi.id} - {offerPoi.offers.map((o) => o.caption).join(", ")}
          </div>
        )
      ); */
    }

    return null;
  };

  return (
    <div className={offerContainerClasses.join(" ")}>
      <div className="scrollable-y" style={{ height: "100%" }}>
        <div className={`${classes.myOffersCloseIcon} m3`}>
          <CloseIconButton fill="#000" clicked={close} />
        </div>
        <h3 className="center mt12">{t("trips.myTrips.itinerary.offers.myOffers.title")}</h3>
        <div className={classes.offerCardsContent}>{renderContent()}</div>
      </div>
    </div>
  );
};

/* <OfferCard
          key={`offer-poi-ref-card-${offer.id}`}
          poi={offer.id}
          buttonType={-1}
          poiCardClicked={(p) => {
            // eslint-disable-next-line no-console
            console.log(p);
            // focusPoi(p);
          }}
          addRemoveAlternativePoi={(poi: Model.Poi) => {
            const currentFavoriteId = (favorites || []).find((f) => f.poiId === poi.id)?.id;
            if (currentFavoriteId) {
              // dispatch(favoriteDeleteAndFetch(currentFavoriteId, poi.id, cityId));
              favoriteDelete(currentFavoriteId, poi.id);
              // eslint-disable-next-line no-console
            } else console.error("FavoriteContainer: favoriteDeleteAndFetch called with unknown favorite id");
          }}
        /> */

export default MyOffersContainer;
