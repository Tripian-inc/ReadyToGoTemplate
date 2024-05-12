/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from "react";
import moment from "moment";
import Model, { Providers } from "@tripian/model";
import classes from "./GygTourInfoForm.module.scss";
import { NumberCounter, DatePicker, Button, CustomPopover } from "@tripian/react";

interface IGygTourInfoForm {
  formPersonsCategories: Providers.Gyg.PersonCategory[];
  personsCategories: (Providers.Gyg.PersonCategory & { count: number })[];
  setPersonsCategories: (personsCategories: (Providers.Gyg.PersonCategory & { count: number })[]) => void;
  availableDates: string[];
  availableDate?: string;
  setAvailableDate: (availableDate: string) => void;
  checkAvailabilityClick: (tourOptionsRequest: Providers.Gyg.TourPriceBreakdownRequest) => void;
  t: (value: Model.TranslationKey) => string;
}

const GygTourInfoForm: React.FC<IGygTourInfoForm> = ({
  formPersonsCategories,
  personsCategories,
  setPersonsCategories,
  availableDates,
  availableDate,
  setAvailableDate,
  checkAvailabilityClick,
  t,
}) => {
  moment.locale(window.twindow.langCode);

  const [clicked, setClicked] = useState<boolean>(false);
  const [showPopOver, setShowPopOver] = useState<boolean>(false);

  const checkAvailabilityOnClick = () => {
    const ticketCounts = {};
    personsCategories.forEach((ticket) => {
      ticketCounts[ticket.ticket_category] = ticket.count;
    });

    const tourOptionsRequest: Providers.Gyg.TourPriceBreakdownRequest = {
      base_data: {
        currency: "USD",
      },
      data: {
        date: availableDate || "",
        participants: ticketCounts,
      },
    };
    checkAvailabilityClick(tourOptionsRequest);
  };

  return (
    <div className={classes.gygTourInfoForm}>
      {availableDates.length === 0 ? (
        <span className={classes.warningMessage}>{t("trips.myTrips.localExperiences.tourDetails.noAvailableDays")}</span>
      ) : (
        <>
          <h3 className={classes.gygTourInfoFormHeader}>{t("trips.myTrips.localExperiences.tourDetails.selectParticipantsAndDate")}</h3>
          <ul className={classes.gygTourInfoFormList}>
            <li>
              <div className={classes.gygTourInfoDatePicker}>
                {availableDate && availableDates.length > 0 && (
                  <DatePicker
                    currentDate={moment(availableDate)}
                    startDate={moment(availableDates[0])}
                    endDate={moment(availableDates[availableDates.length - 1]).add("day", 1)}
                    onchanged={(date) => {
                      if (date) setAvailableDate(date.format("YYYY-MM-DD"));

                      if (clicked) {
                        checkAvailabilityOnClick();
                      }
                    }}
                  />
                )}
              </div>
            </li>
            <CustomPopover
              positions={["bottom"]}
              show={showPopOver}
              backdropClick={(e) => {
                e.stopPropagation();
                setShowPopOver(false);
              }}
              content={
                <div className={classes.gygTourInfoListItemWrapper}>
                  {formPersonsCategories
                    // .filter((x) => x.addon === false)
                    .map((formPersonsCategory) => {
                      const count: number = personsCategories.find((x) => x.ticket_category === formPersonsCategory.ticket_category)?.count ?? 0;
                      return (
                        <li key={formPersonsCategory.name} className={classes.gygTourInfoFormListItem}>
                          <div>
                            <h4 className={classes.gygTourInfoPersonCountText}>
                              <div>{formPersonsCategory.name}</div>
                            </h4>
                            <div className={classes.gygTourInfoPersonAge}>
                              ({t("trips.myTrips.localExperiences.tourDetails.age")}: {formPersonsCategory.age_range.min} - {formPersonsCategory.age_range.max})
                            </div>
                          </div>

                          <div className={classes.gygTourInfoPersonCount}>
                            {personsCategories.length > 0 && (
                              <NumberCounter
                                defaultValue={count}
                                minValue={0}
                                maxValue={100}
                                iconFill="blue"
                                onchange={(newCount) => {
                                  const newPersonsCategories = [...personsCategories];
                                  const findX = newPersonsCategories.findIndex((x) => x.ticket_category === formPersonsCategory.ticket_category);
                                  if (findX > -1) {
                                    newPersonsCategories[findX].count = newCount;
                                    setPersonsCategories(newPersonsCategories);
                                  }

                                  if (clicked) {
                                    checkAvailabilityOnClick();
                                  }
                                }}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                </div>
              }
            >
              <div
                onClick={() => {
                  setShowPopOver(!showPopOver);
                }}
                role="button"
                onKeyDown={() => {}}
                tabIndex={0}
                className={classes.gygTourInfoPeopleButton}
              >
                Select Participants
              </div>
            </CustomPopover>
          </ul>
          {clicked === false && (
            <Button
              className={classes.checkAvailabilityButton}
              onClick={() => {
                checkAvailabilityOnClick();
                setClicked(true);
              }}
              text="Check Availability"
            />
          )}
        </>
      )}
    </div>
  );
};

export default GygTourInfoForm;
