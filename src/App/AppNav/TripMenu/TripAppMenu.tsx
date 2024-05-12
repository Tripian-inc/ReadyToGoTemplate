import React from "react";
import { SvgIcons } from "@tripian/react";
import { useSelector } from "react-redux";
import ICombinedState from "../../../redux/model/ICombinedState";
import Model from "@tripian/model";
import classes from "./TripAppMenu.module.scss";

/**
 * Travel Guide
 * Trip Plan
 */

interface ITripAppMenu {
  onClickBookings: () => void;
  onClickOffers: () => void;
  onClickFavorites: () => void;
  t: (value: Model.TranslationKey) => string;
}

const TripAppMenu: React.FC<ITripAppMenu> = ({ onClickBookings, onClickOffers, onClickFavorites, t }) => {
  const { readOnlyTrip } = useSelector((state: ICombinedState) => ({
    readOnlyTrip: state.trip.readOnly,
  }));

  return (
    <>
      {/* DEALS */}
      {window.tconfig.DEALS_PAGE_URL && (
        <div className={`${classes.appNavIconImage} ${classes.tooltip}`} onClick={() => window.open(window.tconfig.DEALS_PAGE_URL)} role="button" tabIndex={0}>
          <div className={classes.iconImage}>
            <SvgIcons.MustTry size="30px" />
          </div>
          <span className={`${classes.iconImageText} hide-s`}>{t("trips.myTrips.itinerary.deals.title")}</span>
        </div>
      )}
      {/* BOOKINGS */}
      {(window.tconfig.SHOW_RESTAURANT_RESERVATIONS || window.tconfig.SHOW_TOURS_AND_TICKETS) && readOnlyTrip === false && (
        <div className={`${classes.appNavIconImage} ${classes.tooltip}`} onClick={onClickBookings} onKeyPress={() => {}} role="button" tabIndex={0}>
          <div className={classes.iconImage}>
            <SvgIcons.Booking size="30px" />
          </div>
          <span className={`${classes.iconImageText} hide-s`}>{t("trips.myTrips.itinerary.bookings.title")}</span>
        </div>
      )}

      {/* OFFERS */}
      {window.tconfig.SHOW_OFFERS && readOnlyTrip === false && (
        <div className={`${classes.appNavIconImage} ${classes.tooltip} ${classes.appNavIconImageHideS}`} onClick={onClickOffers} onKeyPress={() => {}} role="button" tabIndex={0}>
          <div className={classes.iconImage}>
            <SvgIcons.Offer size="30px" />
          </div>
          <span className={`${classes.iconImageText} hide-s`}>{t("trips.myTrips.itinerary.offers.title")}</span>
        </div>
      )}

      {/* FAVORITES */}
      {readOnlyTrip === false && (
        <div
          className={`${classes.appNavIconImage} ${classes.appNavIconImageHideS} ${classes.tooltip}`}
          onClick={onClickFavorites}
          onKeyPress={() => {}}
          role="button"
          tabIndex={0}
        >
          <div className={classes.iconImage}>
            <SvgIcons.Favorite size="30px" />
          </div>
          <span className={classes.iconImageText}>{t("trips.myTrips.itinerary.favorites.title")}</span>
        </div>
      )}
    </>
  );
};

export default TripAppMenu;
