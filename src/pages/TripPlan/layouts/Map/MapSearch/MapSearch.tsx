import React from "react";
import { /* useDispatch, */ useSelector } from "react-redux";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { SearchThisArea } from "@tripian/react";
import ICombinedState from "../../../../../redux/model/ICombinedState";
/* import { changeSearchThisArea } from '../../../../../redux/action/trip'; */
import classes from "./MapSearch.module.scss";
import useTranslate from "../../../../../hooks/useTranslate";

interface IMapSearch {
  show: boolean;
  poiCategories: Model.PoiCategory[];
  setSearchThisAreaPois: (pois: Model.Poi[]) => void;
}

const MapSearch: React.FC<IMapSearch> = ({ show, poiCategories, setSearchThisAreaPois }) => {
  // const dispatch = useDispatch();

  const zoom = useSelector((state: ICombinedState) => state.gmap.zoomState);

  const { t } = useTranslate();

  const mapSearchClasses = [classes.mapSearch];
  if (!show) mapSearchClasses.push(classes.mapSearchHide);

  const search = (categoryIds: number[]): Promise<Model.Poi[]> => {
    const bounds = window.twindow.map?.getBounds();
    const ne = bounds?.getNorthEast();
    const sw = bounds?.getSouthWest();
    const tripianBounds = [sw?.lat() || 0, ne?.lat() || 0, sw?.lng() || 0, ne?.lng() || 0];

    return api.poisCoordinateSearch({
      poiCategories: categoryIds.join(","),
      // coordinate: { lat: centerLat, lng: centerLng },
      // distance: 2,
      bounds: tripianBounds.join(","),
      limit: 100,
    });
  };

  // if (zoom < 16) return null;

  return (
    <div className={mapSearchClasses.join(" ")}>
      <SearchThisArea
        /* categoryList={poiCategories} */
        searchPoi={search}
        searchPoiCallBack={setSearchThisAreaPois}
        hide={zoom < 13}
        clearPois={() => {
          setSearchThisAreaPois([]);
        }}
        t={t}
      />
    </div>
  );
};

export default MapSearch;
