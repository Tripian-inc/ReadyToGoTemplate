import React, { useMemo, useState } from "react";
import moment from "moment";
import Model from "@tripian/model";
import { FormTemplateToursAndTickets, PreLoading } from "@tripian/react";
import useCities from "../../hooks/useCities";
import AppNav from "../../App/AppNav/AppNav";
import { LOCAL_EXPERIENCES, TOURS_AND_TICKETS } from "../../constants/ROUTER_PATH_TITLE";
import { useHistory } from "react-router";
import useTranslate from "../../hooks/useTranslate";
import classes from "./ToursandTickets.module.scss";

const emptyToursandTicketsProfile: Model.TourAndTickets = {
  cityId: 0,
  cityName: "",
  lat: 0,
  lng: 0,
  arrivalDatetime: moment().add(1, "days").format("YYYY-MM-DD"),
  departureDatetime: moment().add(7, "days").format("YYYY-MM-DD"),
  adult: 1,
};

const ToursandTicketsPage = () => {
  const [toursandTicketsProfileProfile, setToursandTicketsProfile] = useState<Model.TourAndTickets>({
    ...emptyToursandTicketsProfile,
    cityId: window.tconfig.DEFAULT_DESTINATION_ID ?? 0,
  });

  const { cities, loadingCities } = useCities();

  const { t } = useTranslate();

  const history = useHistory();

  const destinations: { destinationId: number; destinationName: string; coordinate: Model.Coordinate; parentName: string }[] = useMemo(() => {
    if (cities) {
      return cities?.map((city) => {
        const destination = {
          destinationId: city.id,
          destinationName: city.name,
          coordinate: city.coordinate,
          parentName: city.parentLocations.length === 0 ? city.country.name : `${city.parentLocations.map((parent) => parent.name).join(", ")}, ${city.country.name}`,
        };

        return destination;
      });
    }
    return [];
  }, [cities]);

  const callbackToursandTicketsProfile = (toursandTicketsProfileParam: Model.TourAndTickets) => {
    setToursandTicketsProfile(toursandTicketsProfileParam);
  };

  if (loadingCities)
    return (
      <>
        <AppNav header={TOURS_AND_TICKETS.HEADER?.(t("trips.toursAndTickets.title"))} />
        <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />;
      </>
    );

  return (
    <>
      <AppNav header={TOURS_AND_TICKETS.HEADER?.(t("trips.toursAndTickets.title"))} />
      <div className="background" style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}>
        {loadingCities ? (
          <div className={classes.createUpdateTripLoading}>
            <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />;
          </div>
        ) : (
          <>
            {toursandTicketsProfileProfile ? (
              <div className="container mt-20 px-10">
                <FormTemplateToursAndTickets
                  destinations={destinations}
                  toursAndTicketsProfile={toursandTicketsProfileProfile}
                  setToursAndTicketsProfile={callbackToursandTicketsProfile}
                  onSubmit={() => {
                    history.push(
                      `${LOCAL_EXPERIENCES.PATH}?city_id=${toursandTicketsProfileProfile.cityId}&city_name=${toursandTicketsProfileProfile.cityName}&lat=${
                        toursandTicketsProfileProfile.lat
                      }&lng=${toursandTicketsProfileProfile.lng}&start_date=${toursandTicketsProfileProfile.arrivalDatetime}&end_date=${
                        toursandTicketsProfileProfile.departureDatetime
                      }&adult=${toursandTicketsProfileProfile.adult}${toursandTicketsProfileProfile.children ? `&children=${toursandTicketsProfileProfile.children}` : ""}`,
                      {
                        customState: TOURS_AND_TICKETS.PATH,
                      }
                    );
                  }}
                  onCancel={() => history.goBack()}
                  t={t}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default ToursandTicketsPage;
