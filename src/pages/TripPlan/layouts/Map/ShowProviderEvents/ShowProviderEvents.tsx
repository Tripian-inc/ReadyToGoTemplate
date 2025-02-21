import React, { FC } from "react";
import { PreLoading } from "@tripian/react";
import classes from "./ShowProviderEvents.module.scss";

const showAllProviderEventsSvg = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 2v4" />
    <path d="M21 11.75V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.25" />
    <path d="m22 22-1.875-1.875" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <circle cx="18" cy="18" r="3" />
  </svg>
);

interface IShowProviderEvents {
  show: boolean;
  loading: boolean;
  setShow: (newEvents: boolean) => void;
}

const ShowProviderEvents: FC<IShowProviderEvents> = ({ show, loading, setShow }) => {
  const onChange = () => setShow(!show);

  return (
    <div className={`${classes.mapButtons} ${classes.showEvents}`}>
      <div
        role="button"
        className={show ? `${classes.showEventsButton} ${classes.showEventsActive}` : classes.showEventsButton}
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={onChange}
      >
        {loading ? <PreLoading color="#000" size="small" /> : showAllProviderEventsSvg}
      </div>
    </div>
  );
};

export default ShowProviderEvents;
