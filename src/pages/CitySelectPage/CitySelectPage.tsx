import React, { useMemo, useState } from "react";
import useCities from "../../hooks/useCities";
import Model, { helper } from "@tripian/model";
import AppNav from "../../App/AppNav/AppNav";
import { CITY_INFO } from "../../constants/ROUTER_PATH_TITLE";
import { DestinationSelect, PreLoading, Button } from "@tripian/react";
import useTranslate from "../../hooks/useTranslate";
import { useHistory } from "react-router";
import classes from "./CitySelectPage.module.scss";

export type RSelectOption = {
  id: number;
  label: string;
  payload: { destinationId: number; destinationName: string; coordinate: Model.Coordinate; parentName: string };
  isSelected?: boolean;
};

const CitySelectPage = () => {
  const [selectedCityId, setSelectedCityId] = useState<number>();
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

  const destinationOptions: RSelectOption[] = useMemo(
    () =>
      destinations
        .sort((a, b) => helper.compareStringForSort(a.destinationName, b.destinationName))
        .map((d) => ({
          id: d.destinationId,
          label: `${d.destinationName} - ${d.parentName}`,
          payload: d,
          isSelected: d.destinationId === selectedCityId,
        })),
    [destinations, selectedCityId]
  );

  const handleCitySelection = (selectedOption: RSelectOption) => {
    setSelectedCityId(selectedOption.id);
  };

  return (
    <div>
      <AppNav header={CITY_INFO.HEADER?.(t("cityInfo.title"))} />
      {loadingCities ? (
        <div className={classes.loadingWrapper}>
          <PreLoading />
        </div>
      ) : (
        <div className="bg-background-color">
          <div className="container mx-auto px-4 py-12">
            <div className="w-5/6 sm:w-5/6 md:w-4/6 lg:w-3/6 my-10 mx-auto">
              <DestinationSelect
                options={destinationOptions}
                selectedOptionId={selectedCityId}
                onSelectedOptionChange={handleCitySelection}
                placeHolder={t("trips.createNewTrip.form.destination.city.placeholder")}
              />

              <div className="row center mt-8">
                <Button text={t("trips.toursAndTickets.submit")} color="primary" onClick={() => history.push(`${CITY_INFO.PATH}/${selectedCityId}`)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelectPage;
