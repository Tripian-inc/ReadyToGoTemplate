/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unused-prop-types */

import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch } from 'react-redux';
import Model, { helper } from "@tripian/model";
import { PreLoading, CloseIconButton, OfferCard, Button } from "@tripian/react";

// import IFavoritePoi from "../../../../../models/IFavoritePoi";
// import { changeFavoritesVisible } from '../../../../../redux/action/layout';
import useFocus from "../../../../../hooks/useFocus";
import { useHistory } from "react-router";
import { QR_READER } from "../../../../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../../../../hooks/useTranslate";
import classes from "./SearchOffersContainer.module.scss";

interface ISearchOffersContainer {
  show: boolean;
  close: () => void;
  dayIndex: number;
  plans?: Model.Plan[];
  loadingSearchOffers: boolean;
  myAllOffers?: Model.Poi[];
  offersResult: Model.Poi[];
  isLoadingOffer: (offerId: number) => boolean;
  offerOptIn: (offerId: number, optInDate: string) => Promise<void>;
  offerOptOut: (offerId: number) => Promise<void>;
}

const SearchOffersContainer: React.FC<ISearchOffersContainer> = ({
  show,
  close,
  dayIndex,
  plans,
  loadingSearchOffers,
  myAllOffers,
  offersResult,
  isLoadingOffer,
  offerOptIn,
  offerOptOut,
}) => {
  const [tab, setTab] = useState<Model.PRODUCT_TYPE_NAME>();
  const currentPlanDate = useMemo(() => (plans && dayIndex < plans.length ? plans[dayIndex].date : undefined), [dayIndex, plans]);
  const [displayOfferPois, setDisplayOfferPois] = useState<Model.Poi[]>();

  const { focusPoi } = useFocus();

  const { t } = useTranslate();

  const history = useHistory();
  const seacrhOfferTextClasses = [classes.text];
  const searchOfferContainerClasses = [classes.searchOfferContainer];
  if (!window.tconfig.SHOW_OVERVIEW) searchOfferContainerClasses.push("container-height");
  else searchOfferContainerClasses.push("container-height-tab");
  if (show) searchOfferContainerClasses.push(classes.searchOfferContainerOpen);
  else searchOfferContainerClasses.push(classes.searchOffersContainerClose);
  if (window.tconfig.BRAND_NAME === "bookbarbados") {
    searchOfferContainerClasses.push(classes.backgroundImage);
    seacrhOfferTextClasses.push(classes.bbTextColor);
  }

  useEffect(() => {
    if (offersResult) {
      let filteredPois: Model.Poi[] = [];
      if (tab === undefined) {
        filteredPois = helper.deepCopy(offersResult);
        setDisplayOfferPois(filteredPois);
      } else {
        filteredPois = helper.deepCopy(offersResult.filter((x) => x.offers.some((y) => y.productType.name === tab)));
        filteredPois.forEach((poi) => {
          poi.offers = poi.offers.filter((y) => y.productType.name === tab);
        });
        setDisplayOfferPois(filteredPois);
      }
    }
  }, [offersResult, tab]);

  const renderContent = () => {
    if (loadingSearchOffers) return <PreLoading />;

    if (offersResult) {
      if (offersResult.length === 0)
        return (
          <div className="center">
            <span className={seacrhOfferTextClasses.join(" ")}>{t("trips.myTrips.itinerary.offers.emptyOffersMessage")}</span>
          </div>
        );

      return displayOfferPois?.map((offerPoi: Model.Poi) => {
        return offerPoi.offers.map((offer: Model.Offer) => {
          if (!myAllOffers?.some((p) => p.offers.some((x) => x.id === offer.id))) {
            return (
              <div className="my-2">
                <OfferCard
                  key={`search-offer-result-poi-${offer.id}`}
                  offer={offer}
                  planDate={currentPlanDate}
                  isMyOffer={false}
                  optedIn={false}
                  isLoadingOffer={isLoadingOffer}
                  optClicked={(optIn: boolean, id: number, optInDate?: string) => {
                    if (currentPlanDate) {
                      if (optIn) {
                        offerOptIn(id, optInDate || currentPlanDate);
                      } else {
                        return offerOptOut(id);
                      }
                    }
                  }}
                  cardClicked={() => focusPoi(offerPoi)}
                  poiName={offerPoi.name}
                  redeemClicked={() => history.push(QR_READER.PATH)}
                />
              </div>
            );
          }
          return null;
        });
      });
    }

    return null;
  };

  return (
    <div className={searchOfferContainerClasses.join(" ")}>
      <div className="scrollable-y" style={{ height: "100%" }}>
        <div className={`${classes.searchOffersCloseIcon} m3`}>
          <CloseIconButton fill="#000" className={seacrhOfferTextClasses.join(" ")} clicked={close} />
        </div>
        {/* <h3 className="center mt12 max-md:text-white">Search Offers Results</h3> */}
        <div className={classes.offerTabs}>
          <Button
            className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.EXPERIENCES ? classes.selected : classes.unSelected}`}
            text={t("trips.myTrips.itinerary.offers.categories.experiences").toUpperCase()}
            onClick={() => {
              if (tab === Model.PRODUCT_TYPE_NAME.EXPERIENCES) {
                setTab(undefined);
              } else {
                setTab(Model.PRODUCT_TYPE_NAME.EXPERIENCES);
              }
            }}
          />
          <Button
            className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.DINING ? classes.selected : classes.unSelected}`}
            text={t("trips.myTrips.itinerary.offers.categories.dining").toUpperCase()}
            onClick={() => {
              if (tab === Model.PRODUCT_TYPE_NAME.DINING) {
                setTab(undefined);
              } else {
                setTab(Model.PRODUCT_TYPE_NAME.DINING);
              }
            }}
          />
          <Button
            className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.SHOPPING ? classes.selected : classes.unSelected}`}
            text={t("trips.myTrips.itinerary.offers.categories.shopping").toUpperCase()}
            onClick={() => {
              if (tab === Model.PRODUCT_TYPE_NAME.SHOPPING) {
                setTab(undefined);
              } else {
                setTab(Model.PRODUCT_TYPE_NAME.SHOPPING);
              }
            }}
          />
        </div>
        <div className={classes.offerCardsContent}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SearchOffersContainer;
