import React, { useEffect } from "react";
import moment from "moment";
import { useParams, useHistory } from "react-router-dom";
import { PageLoading } from "@tripian/react";
import { TRIP_PLAN } from "../../constants/ROUTER_PATH_TITLE";
import usePlan from "../../hooks/usePlan";
import AppNav from "../../App/AppNav/AppNav";
import TripAppMenu from "../../App/AppNav/TripMenu/TripAppMenu";
import useTripHashParams from "../../hooks/useTripHashParams";
import useTranslate from "../../hooks/useTranslate";

const TripPlanRedirect = () => {
  const { plans } = usePlan();

  const history = useHistory();

  const { t } = useTranslate();

  const { hashParam } = useParams<{ hashParam: string }>();
  const { hash, tripReference } = useTripHashParams(hashParam);

  document.title = `${TRIP_PLAN.TITLE(t("tripPlan.header"))} - ${tripReference?.city.name || ""} - ${hash}`;

  /* */
  /* */
  /* ******* USE STATES ******* */
  /* */

  // Trip Day Index
  useEffect(() => {
    if (plans) {
      const getInitialDayIndex = () => {
        const plansFirstDay = moment(plans[0].date);
        const plansLastDay = moment(plans[plans.length - 1].date);
        const datetimeNow = moment().startOf("day");
        if (datetimeNow.diff(plansFirstDay, "days") >= 0 && plansLastDay.diff(datetimeNow, "days") >= 0) {
          return plans.findIndex((p) => p.date === datetimeNow.format("YYYY-MM-DD"));
        }
        return 0;
      };

      const initialDayIndex = getInitialDayIndex();
      history.replace(`${TRIP_PLAN.PATH}/${hashParam}/${initialDayIndex}`);
    }
  }, [hashParam, history, plans]);

  return (
    <>
      <AppNav tripInfoHeader={false} tripAppMenu={<TripAppMenu onClickBookings={() => {}} onClickOffers={() => {}} onClickFavorites={() => {}} t={t} />} />
      <PageLoading />
    </>
  );
};

export default TripPlanRedirect;
