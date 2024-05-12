import React, { FC } from "react";
import classes from "./ShowAccommodations.module.scss";

const showAllAlternativesSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
  </svg>
);

/* const backSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g data-name="Layer 2">
      <g data-name="arrow-back">
        <rect width="24" height="24" opacity="0" transform="rotate(90 12 12)" />
        <path d="M19 11H7.14l3.63-4.36a1 1 0 1 0-1.54-1.28l-5 6a1.19 1.19 0 0 0-.09.15c0 .05 0 .08-.07.13A1 1 0 0 0 4 12a1 1 0 0 0 .07.36c0 .05 0 .08.07.13a1.19 1.19 0 0 0 .09.15l5 6A1 1 0 0 0 10 19a1 1 0 0 0 .64-.23 1 1 0 0 0 .13-1.41L7.14 13H19a1 1 0 0 0 0-2z" />
      </g>
    </g>
  </svg>
); */
interface IShowAccommodations {
  show: boolean;
  setShow: (newShowAccommodations: boolean) => void;
}

const ShowAccommodations: FC<IShowAccommodations> = ({ show, setShow }) => {
  const onChange = () => setShow(!show);

  return (
    <div className={`${classes.mapButtons} ${classes.showAccommodations}`}>
      <div
        role="button"
        className={show ? `${classes.showAccommodationsButton} ${classes.showAccommodationsActive}` : classes.showAccommodationsButton}
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={onChange}
      >
        {showAllAlternativesSvg}
      </div>
    </div>
  );
};

export default ShowAccommodations;
