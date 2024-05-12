import React, { FC /* , useState */ } from "react";
// import { useDispatch } from 'react-redux';
/* import { changeShowAllAlternative } from '../../../../../redux/action/trip';
 */
import classes from "./ShowAllAlternatives.module.scss";

const showAllAlternativesSvg = (
  <svg className="components-base-Svg-Svg__svg--2nyKV car-rent-svg" viewBox="0 0 640 512">
    <path d="M629.657 343.598L528.971 444.284c-9.373 9.372-24.568 9.372-33.941 0L394.343 343.598c-9.373-9.373-9.373-24.569 0-33.941l10.823-10.823c9.562-9.562 25.133-9.34 34.419.492L480 342.118V160H292.451a24.005 24.005 0 0 1-16.971-7.029l-16-16C244.361 121.851 255.069 96 276.451 96H520c13.255 0 24 10.745 24 24v222.118l40.416-42.792c9.285-9.831 24.856-10.054 34.419-.492l10.823 10.823c9.372 9.372 9.372 24.569-.001 33.941zm-265.138 15.431A23.999 23.999 0 0 0 347.548 352H160V169.881l40.416 42.792c9.286 9.831 24.856 10.054 34.419.491l10.822-10.822c9.373-9.373 9.373-24.569 0-33.941L144.971 67.716c-9.373-9.373-24.569-9.373-33.941 0L10.343 168.402c-9.373 9.373-9.373 24.569 0 33.941l10.822 10.822c9.562 9.562 25.133 9.34 34.419-.491L96 169.881V392c0 13.255 10.745 24 24 24h243.549c21.382 0 32.09-25.851 16.971-40.971l-16.001-16z" />
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
interface IShowAllAlternatives {
  show: boolean;
  setShow: (newShowAllalternatives: boolean) => void;
}

const ShowAllAlternatives: FC<IShowAllAlternatives> = ({ show, setShow }) => {
  /* const [show, setShow] = useState<boolean>(false); */

  /* const dispatch = useDispatch(); */

  const onChange = () => {
    if (show) {
      setShow(false);
      // dispatch(changeShowAllAlternative(false));
    } else {
      setShow(true);
      // dispatch(changeShowAllAlternative(true));
    }
  };

  return (
    <div className={`${classes.mapButtons} ${classes.showAllAlternatives}`}>
      <div
        role="button"
        className={show ? `${classes.showAllAlternativesButton} ${classes.showAllAlternativesButtonActive}` : classes.showAllAlternativesButton}
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={onChange}
      >
        {showAllAlternativesSvg}
      </div>

      {/* {show ? (
        <>
          <div className="map-button-split" />
          <div
            role="button"
            className={show ? 'map-button show-all-alternatives-button show-all-alternatives-button-active' : 'show-all-alternatives-button'}
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={onChange}
          >
            {backSvg}
          </div>
        </>
      ) : null} */}
    </div>
  );
};

export default ShowAllAlternatives;
