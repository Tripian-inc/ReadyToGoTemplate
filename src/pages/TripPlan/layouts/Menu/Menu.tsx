import React from "react";

/* import { useSelector, useDispatch } from 'react-redux';
import ICombinedState from '../../../../redux/model/ICombinedState';
import { changeCenter } from '../../../../redux/action/gmaps';
import { changeDay } from '../../../../redux/action/trip';
 */

import classes from "./Menu.module.scss";
// import {
//   // changeFavoritesVisible,
//   // changeSearchVisible,
//   // changeLocalExperiencesModalVisible,
// } from '../../../../redux/action/layout';

interface IMenu {
  listShown: boolean;
  showList: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

  showExplorePlaces: () => void;
  showFavorites: () => void;
  showOffers: () => void;
  showLocalExperiences: () => void;

  /* 
  changeZoomProp: (zoom: number) => void;
  changeCenterProp: (latlng: Model.Coordinate) => void;
  */
}

const Menu: React.FC<IMenu> = ({ listShown, showList, showExplorePlaces, showFavorites, showOffers, showLocalExperiences }) => (
  /*   const dayIndex = useSelector((state: ICombinedState) => state.trip.day);  */

  <div className={classes.menu}>
    <div className={`${classes.mitem} ${classes.search}`} onClick={showExplorePlaces} onKeyDown={() => {}} role="button" tabIndex={0}>
      {" "}
    </div>
    <div className={`${classes.mitem} ${classes.favorites}`} onClick={showFavorites} onKeyDown={() => {}} role="button" tabIndex={0}>
      {" "}
    </div>
    <div className={`${classes.mitem} ${classes.shape}`} />
    <div className={listShown ? `${classes.circle} ${classes.shadow}` : classes.circle}>
      <input className={listShown ? classes.mapIcon : classes.listIcon} type="button" onClick={showList} />
    </div>
    <div
      className={`${classes.mitem} ${classes.localExperiences}`}
      onClick={() => window.tconfig.PROVIDERS.tourAndTicket.length > 0 && showLocalExperiences()}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
    >
      {" "}
    </div>
    <div className={`${classes.mitem} ${classes.offers}`} onClick={showOffers} onKeyDown={() => {}} role="button" tabIndex={0}>
      {" "}
    </div>
  </div>
);

export default Menu;
