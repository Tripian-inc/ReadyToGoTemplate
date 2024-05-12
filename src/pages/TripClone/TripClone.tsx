import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { PageLoading } from "@tripian/react";
import Model from "@tripian/model";
import { TRIP_CLONE, TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import { api } from "@tripian/core";
import { useDispatch } from "react-redux";
import { changeTripReferences } from "../../redux/action/user";
import useTrip from "../../hooks/useTrip";
import { changePlans, changeReadOnly, changeReference } from "../../redux/action/trip";
import useTranslate from "../../hooks/useTranslate";

const TripClonePage = () => {
  const { hashParam } = useParams<{ hashParam: string }>();
  const { tripFetchCallback } = useTrip();

  const { t } = useTranslate();

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    api.tripCloneCombo(hashParam).then((data: { trip: Model.Trip; tripReferences: Model.TripReference[] }) => {
      dispatch(changeTripReferences(data.tripReferences));
      dispatch(changeReadOnly(false));
      dispatch(changeReference({ id: data.trip.id, city: data.trip.city, shared: data.trip.shared, tripHash: data.trip.tripHash, tripProfile: data.trip.tripProfile }));
      dispatch(changePlans(data.trip.plans));
      history.replace(`${TRIP_PLAN.PATH}/${data.trip.tripHash}`);
    });
  }, [dispatch, hashParam, history, tripFetchCallback]);

  // useEffect(() => {
  //   api.tripClone(hashParam).then((myClone: Model.Trip) => {
  //     tripFetchCallback(myClone, false);
  //     history.replace(`${TRIP_PLAN.PATH}/${myClone.tripHash}`);
  //   });
  // }, [hashParam, history, tripFetchCallback]);

  document.title = `${TRIP_CLONE.TITLE(t("tripCopy.header"))} - ${hashParam}`;

  return <PageLoading />;
};

export default TripClonePage;
