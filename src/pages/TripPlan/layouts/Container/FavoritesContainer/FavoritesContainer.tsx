/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unused-prop-types */

import React, { useEffect /* , { useCallback } */ } from "react";
// import { useDispatch } from 'react-redux';
// import Model from "@tripian/model";
import { PoiRefCard, PreLoading, CloseIconButton } from "@tripian/react";

import IFavoritePoi from "../../../../../models/IFavoritePoi";
// import { changeFavoritesVisible } from '../../../../../redux/action/layout';

import useFavorite from "../../../../../hooks/useFavorite";
import useFocus from "../../../../../hooks/useFocus";
import useTranslate from "../../../../../hooks/useTranslate";
import classes from "./FavoritesContainer.module.scss";

interface IFavoritesContainer {
  show: boolean;
  close: () => void;
  dayIndex: number;
}

const FavoritesContainer: React.FC<IFavoritesContainer> = ({ show, close /* , dayIndex */ }) => {
  const { cityId, favorites, loadingFavorites, loadingFavoritePoi /*, favoriteDelete */, favoritesFetch } = useFavorite();
  const { focusPoi } = useFocus();

  const { t } = useTranslate();

  useEffect(() => {
    if (favorites === undefined && loadingFavorites === false && cityId !== undefined) favoritesFetch();
  }, [cityId, favorites, favoritesFetch, loadingFavorites]);

  const favoritesContainerClasses = [classes.favoritesContainer];
  if (!window.tconfig.SHOW_OVERVIEW) favoritesContainerClasses.push("container-height");
  else favoritesContainerClasses.push("container-height-tab");
  if (show) favoritesContainerClasses.push(classes.favoritesContainerOpen);
  else favoritesContainerClasses.push(classes.favoritesContainerClose);

  const renderContent = () => {
    if (loadingFavorites && favorites === undefined) return <PreLoading />;

    if (favorites) {
      if (favorites.length === 0)
        return (
          <div className="center">
            <span>{t("trips.myTrips.itinerary.favorites.emptyMessage")}</span>{" "}
          </div>
        );

      return favorites.map((favoritePoi: IFavoritePoi) =>
        loadingFavoritePoi(favoritePoi.poiId) ? (
          <div key={`favorite-loading-${favoritePoi.id}`} className={classes.favoriteItemsLoading}>
            <PreLoading size="small" />
          </div>
        ) : (
          <PoiRefCard
            key={`favorite-poi-ref-card-${favoritePoi.id}`}
            poi={favoritePoi.poi}
            poiCardClicked={(p) => {
              focusPoi(p);
            }}
            hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
            hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
            hideOfferIcon={!window.tconfig.SHOW_OFFERS}
            TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
            RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
            t={t}
          />
        )
      );
    }

    return null;
  };

  return (
    <div className={favoritesContainerClasses.join(" ")}>
      <div className="scrollable-y" style={{ height: "100%" }}>
        <div className={`${classes.favoritesCloseIcon} m3`}>
          <CloseIconButton fill="#000" clicked={close} />
        </div>
        <h3 className="center mt12">{t("trips.myTrips.itinerary.favorites.title")}</h3>
        <div className="px4 mt5">{renderContent()}</div>
      </div>
    </div>
  );
};

export default FavoritesContainer;
