import React, { FC } from "react";
import { PreLoading } from "@tripian/react";
import classes from "./ShowProviderVideos.module.scss";

const showAllAlternativesSvg = (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M4 5.49683V18.5032C4 20.05 5.68077 21.0113 7.01404 20.227L18.0694 13.7239C19.384 12.9506 19.384 11.0494 18.0694 10.2761L7.01404 3.77296C5.68077 2.98869 4 3.95 4 5.49683Z"
      stroke="#323232"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

interface IShowProviderVideos {
  show: boolean;
  loading: boolean;
  setShow: (newTours: boolean) => void;
}

const ShowProviderVideos: FC<IShowProviderVideos> = ({ show, loading, setShow }) => {
  const onChange = () => setShow(!show);

  return (
    <div className={`${classes.mapButtons} ${classes.showTours}`}>
      <div role="button" className={show ? `${classes.showToursButton} ${classes.showToursActive}` : classes.showToursButton} tabIndex={0} onKeyDown={() => {}} onClick={onChange}>
        {loading ? <PreLoading color="#323232" size="small" /> : showAllAlternativesSvg}
      </div>
    </div>
  );
};

export default ShowProviderVideos;
