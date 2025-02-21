import Model from "@tripian/model";
import { PreLoading, SvgIcons } from "@tripian/react";
import React, { FC, useEffect, useState } from "react";
import classes from "./ShowSearchOffers.module.scss";

interface IShowSearchOffers {
  show: boolean;
  setShow: (newShowOffers: boolean) => void;
  setSearchThisAreaPois: (pois: Model.Poi[]) => void;
  loadingSearchOffers: boolean;
  offersResult: Model.Poi[];
  searchOffer: () => Promise<Model.Poi[]>;
}

const ShowSearchOffers: FC<IShowSearchOffers> = ({ show, setShow, setSearchThisAreaPois, loadingSearchOffers, offersResult, searchOffer }) => {
  const [newSearch, setNewSearch] = useState(true);

  useEffect(() => {
    if (show === false) {
      setSearchThisAreaPois([]);
      setNewSearch(true);
    }
  }, [setSearchThisAreaPois, show]);

  useEffect(() => {
    if (newSearch === true && show === true && loadingSearchOffers === false) {
      setNewSearch(false);
      searchOffer().then(() => {
        setSearchThisAreaPois(offersResult);
      });
    }
  }, [loadingSearchOffers, newSearch, offersResult, searchOffer, setSearchThisAreaPois, show]);

  return (
    <div className={`${classes.mapButtons} ${classes.showSearchOffers}`}>
      {loadingSearchOffers ? (
        <PreLoading color="#000" size="small" />
      ) : (
        <div
          role="button"
          className={show ? `${classes.showSearchOffersButton} ${classes.showSearchOffersActive}` : classes.showSearchOffersButton}
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={() => {
            setShow(!show);
          }}
        >
          <SvgIcons.OfferNew fill={show ? "var(--success-color)" : "var(--danger-color)"} size="30px" />
        </div>
      )}
    </div>
  );
};

export default ShowSearchOffers;
