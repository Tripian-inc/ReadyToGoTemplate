import React, { useState } from "react";

import gmapGlobal from "../../../../../redux/gmapGlobal";

import classes from "./CurrentLocation.module.scss";

const currentLocationSvg = (
  <svg version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 188.111 188.111">
    <g>
      <path
        d="M94.052,0C42.19,0.001,0,42.194,0.001,94.055c0,51.862,42.191,94.056,94.051,94.057
		c51.864-0.001,94.059-42.194,94.059-94.056C188.11,42.193,145.916,0,94.052,0z M94.052,173.111
		c-43.589-0.001-79.051-35.465-79.051-79.057C15,50.464,50.462,15.001,94.052,15c43.593,0,79.059,35.464,79.059,79.056
		C173.11,137.646,137.645,173.11,94.052,173.111z"
      />
      <path
        d="M94.053,50.851c-23.821,0.002-43.202,19.384-43.202,43.204c0,23.824,19.381,43.206,43.203,43.206
		c23.823,0,43.205-19.382,43.205-43.205C137.259,70.232,117.877,50.851,94.053,50.851z M94.054,122.261
		c-15.551,0-28.203-12.653-28.203-28.206c0-15.55,12.652-28.203,28.203-28.204c15.553,0,28.205,12.653,28.205,28.205
		C122.259,109.608,109.606,122.261,94.054,122.261z"
      />
      <circle cx="94.055" cy="94.056" r="16.229" />
    </g>
  </svg>
);

const backSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g data-name="Layer 2">
      <g data-name="arrow-back">
        <rect width="24" height="24" opacity="0" transform="rotate(90 12 12)" />
        <path d="M19 11H7.14l3.63-4.36a1 1 0 1 0-1.54-1.28l-5 6a1.19 1.19 0 0 0-.09.15c0 .05 0 .08-.07.13A1 1 0 0 0 4 12a1 1 0 0 0 .07.36c0 .05 0 .08.07.13a1.19 1.19 0 0 0 .09.15l5 6A1 1 0 0 0 10 19a1 1 0 0 0 .64-.23 1 1 0 0 0 .13-1.41L7.14 13H19a1 1 0 0 0 0-2z" />
      </g>
    </g>
  </svg>
);

const CurrentLocation = () => {
  const [show, setShow] = useState<boolean>(false);

  const onChange = () => {
    if (show) {
      setShow(false);
      gmapGlobal.hideMeMarker();
    } else {
      setShow(true);
      gmapGlobal.showMeMarker();
    }
  };

  return (
    <div className={`${classes.mapButtons} ${classes.currentLocation}`}>
      <div
        role="button"
        className={show ? `${classes.mapButton} ${classes.currentLocationButton} ${classes.currentLocationButtonActive}` : classes.currentLocationButton}
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={onChange}
      >
        {currentLocationSvg}
      </div>

      {show ? (
        <>
          <div className={classes.mapButtonSplit} />
          <div
            role="button"
            className={show ? `${classes.mapButton} ${classes.currentLocationButton} ${classes.currentLocationButtonActive}` : classes.currentLocationButton}
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={onChange}
          >
            {backSvg}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CurrentLocation;
