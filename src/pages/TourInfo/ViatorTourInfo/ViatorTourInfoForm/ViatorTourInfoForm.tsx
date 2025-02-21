/* eslint-disable import/no-extraneous-dependencies */
import React, { useMemo, useState } from "react";
import moment from "moment-timezone";
import Model, { helper, Providers } from "@tripian/model";
import { NumberCounter, DatePicker, Button, CustomPopover, Notification, SvgIcons } from "@tripian/react";
import classes from "./ViatorTourInfoForm.module.scss";

interface IViatorTourInfoForm {
  formPersonsCategories: Providers.Viator.AgeBand[];
  personsCategories: (Providers.Viator.AgeBand & { count: number })[];
  setPersonsCategories: (personsCategories: (Providers.Viator.AgeBand & { count: number })[]) => void;
  bookableItems: Providers.Viator.BookableItem[];
  productCode: string;
  productOptionCode?: string;
  productURL: string;
  availableDate: string;
  setAvailableDate: (availableDate: string) => void;
  checkAvailabilityClick: (tourOptionsRequest: Providers.Viator.AvailabilityCheckRequest) => void;
  bookingRequirements?: Providers.Viator.BookingRequirements;
  timeZone?: string;
  t: (value: Model.TranslationKey) => string;
}

const ViatorTourInfoForm: React.FC<IViatorTourInfoForm> = ({
  formPersonsCategories,
  personsCategories,
  setPersonsCategories,
  bookableItems,
  productCode,
  productOptionCode,
  productURL,
  availableDate,
  setAvailableDate,
  checkAvailabilityClick,
  bookingRequirements,
  timeZone = "UTC",
  t,
}) => {
  moment.locale(window.twindow.langCode);

  const [showPopOver, setShowPopOver] = useState<boolean>(false);
  const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);
  const [showAdultRequiredWarning, setShowAdultRequiredWarning] = useState<boolean>(false);
  const [prevPersonsCategories, setPrevPersonsCategories] = useState<(Providers.Viator.AgeBand & { count: number })[]>([]);

  const minimumDateTime = moment.tz(timeZone).add(1, "day");

  const isStateChanged = useMemo(() => {
    if (prevPersonsCategories.length !== personsCategories.length) {
      return true;
    }

    // Compare each `ageBand` and `count`
    return personsCategories.some((currentItem) => {
      const previousItem = prevPersonsCategories.find((item) => item.ageBand === currentItem.ageBand);
      return !previousItem || previousItem.count !== currentItem.count;
    });
  }, [prevPersonsCategories, personsCategories]);

  const backdropClickHandler = (e: MouseEvent) => {
    e.stopPropagation();

    if (isStateChanged) {
      checkAvailabilityOnClick();
    }

    setShowPopOver(false);
  };

  const checkAvailabilityOnClick = () => {
    const availabilityRequest: Providers.Viator.AvailabilityCheckRequest = {
      productCode,
      travelDate: availableDate || "",
      currency: "USD",
      paxMix: personsCategories
        .filter((item) => item.count > 0)
        .map((item) => ({
          ageBand: item.ageBand,
          numberOfTravelers: item.count,
        })),
    };

    const newPersonsCategories = helper.deepCopy(personsCategories);
    setPrevPersonsCategories(newPersonsCategories);
    checkAvailabilityClick(availabilityRequest);
  };

  const availableDates: string[] = useMemo(() => {
    const availableDatesSet = new Set<string>();

    bookableItems.forEach((bookableItem) => {
      bookableItem.seasons.forEach((season) => {
        const endDate = season.endDate ? moment(season.endDate) : moment().add(1, "year");
        let startDate: moment.Moment;

        if (moment(season.startDate).isBefore(minimumDateTime, "day")) {
          startDate = moment(minimumDateTime);
        } else if (endDate.isAfter(moment(season.startDate), "day")) {
          startDate = moment(season.startDate);
        } else {
          return;
        }

        const daysOfWeekRecords = season.pricingRecords.filter((record) => record.daysOfWeek);

        const currentDate = moment(startDate);
        while (currentDate.isSameOrBefore(endDate, "day")) {
          if (!startDate || currentDate.isSameOrAfter(moment(startDate), "day")) {
            const dayOfWeek = currentDate.clone().locale("en").format("dddd").toUpperCase(); // "MONDAY", "TUESDAY" vb.

            if (Array.isArray(daysOfWeekRecords) && daysOfWeekRecords.length > 0) {
              const isDayOfWeekAvailable = daysOfWeekRecords.some((record) => record.daysOfWeek.includes(dayOfWeek));

              if (isDayOfWeekAvailable) {
                const unavailableDates = daysOfWeekRecords.flatMap((record) =>
                  (record.timedEntries ?? []).flatMap((entry) => (entry.unavailableDates ? entry.unavailableDates.map((dateEntry) => dateEntry.date) : []))
                );
                if (!unavailableDates.includes(currentDate.format("YYYY-MM-DD"))) {
                  availableDatesSet.add(currentDate.format("YYYY-MM-DD"));
                }
              }
            }
          }
          currentDate.add(1, "day");
        }
      });
    });

    return Array.from(availableDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [bookableItems, minimumDateTime]);

  const isButtonDisabled = useMemo(() => {
    const totalTravelers = personsCategories.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    const hasAdult = personsCategories.some((category) => (category.ageBand === "ADULT" || category.ageBand === "TRAVELER") && category.count > 0);

    // Check if all counts meet their respective minTravelersPerBooking requirement
    const meetsMinTravelersPerBooking = personsCategories.every((category) => category.count >= (category.minTravelersPerBooking || 0));

    return !!(
      !availableDate ||
      (bookingRequirements?.maxTravelersPerBooking !== undefined && totalTravelers > bookingRequirements.maxTravelersPerBooking) ||
      (bookingRequirements?.minTravelersPerBooking !== undefined && totalTravelers < bookingRequirements.minTravelersPerBooking) ||
      (bookingRequirements?.requiresAdultForBooking && !hasAdult) || // Adult required but not present
      !meetsMinTravelersPerBooking
    );
  }, [availableDate, bookingRequirements, personsCategories]);

  // if (window.tconfig.PROVIDERS.tourAndTicket.find((t) => t.id === Model.PROVIDER_ID.VIATOR)?.prod === true) {
  //   return (
  //     <div className={classes.mainDiv}>
  //       <div className="center">
  //         <Button color="primary" className={classes.addToChartButton} onClick={() => window.open(productURL)} text={t("trips.myTrips.localExperiences.tourDetails.bookNow")} />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={classes.gygTourInfoForm}>
      {availableDates.length === 0 ? (
        <span className={classes.warningMessage}>{t("trips.myTrips.localExperiences.tourDetails.noAvailableDays")}</span>
      ) : (
        <>
          <h3 className={classes.gygTourInfoFormHeader}>{t("trips.myTrips.localExperiences.tourDetails.selectParticipantsAndDate")}</h3>
          <ul className={classes.gygTourInfoFormList}>
            <li>
              <div className={classes.viatorTourInfoDatePicker}>
                {availableDate && availableDates.length > 0 && (
                  <DatePicker
                    currentDate={moment(availableDate)}
                    startDate={moment(availableDates[0])}
                    endDate={moment(availableDates[availableDates.length - 1])}
                    onchanged={(date) => {
                      if (date) {
                        const selectedDate = date.format("YYYY-MM-DD");
                        setAvailableDate(selectedDate);
                      }
                    }}
                  />
                )}
              </div>
            </li>
            <CustomPopover
              positions={["bottom"]}
              show={showPopOver}
              backdropClick={backdropClickHandler}
              content={
                <div className={classes.gygTourInfoListItemWrapper}>
                  {formPersonsCategories.map((formPersonsCategory, i) => {
                    const count: number = personsCategories.find((x) => x.ageBand === formPersonsCategory.ageBand)?.count ?? 0;
                    return (
                      <li key={`${formPersonsCategory.ageBand}-${i}`} className={classes.gygTourInfoFormListItem}>
                        <div>
                          <h4 className={classes.gygTourInfoPersonCountText}>
                            <div>
                              {formPersonsCategory.ageBand} ({formPersonsCategory.startAge} - {formPersonsCategory.endAge})
                            </div>
                          </h4>
                          <div className={classes.gygTourInfoPersonAge}>
                            ({t("trips.myTrips.localExperiences.tourDetails.minimum")}: {formPersonsCategory.minTravelersPerBooking},{" "}
                            {t("trips.myTrips.localExperiences.tourDetails.max")}: {formPersonsCategory.maxTravelersPerBooking})
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
                                const findX = newPersonsCategories.findIndex((x) => x.ageBand === formPersonsCategory.ageBand);

                                if (findX > -1) {
                                  newPersonsCategories[findX].count = newCount;

                                  // Check if total travelers exceed the maximum limit
                                  const totalTravelers = newPersonsCategories.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);
                                  if (bookingRequirements?.maxTravelersPerBooking && totalTravelers > bookingRequirements.maxTravelersPerBooking) {
                                    setShowWarningMessage(true);
                                  } else {
                                    setShowWarningMessage(false); // Remove the warning if the condition is no longer met
                                  }

                                  // Check if adult is required and none is present
                                  const hasAdult = newPersonsCategories.some((category) => (category.ageBand === "ADULT" || category.ageBand === "TRAVELER") && category.count > 0);
                                  if (bookingRequirements?.requiresAdultForBooking && !hasAdult) {
                                    setShowAdultRequiredWarning(true);
                                  } else {
                                    setShowAdultRequiredWarning(false); // Remove the warning if an adult is added
                                  }

                                  // Update the state with the new values
                                  setPersonsCategories(newPersonsCategories);
                                }
                              }}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                  <h3 className={classes.viatorTourInfoFormMaxWarning}>
                    ( {t("trips.myTrips.localExperiences.tourDetails.minimum")} {bookingRequirements?.minTravelersPerBooking} - &nbsp;
                    {t("trips.myTrips.localExperiences.tourDetails.max")} {bookingRequirements?.maxTravelersPerBooking} {t("trips.myTrips.localExperiences.tourDetails.traveler")} )
                  </h3>
                  <Button
                    disabled={isButtonDisabled}
                    className="w-full mt-4 !bg-[#304c84]"
                    onClick={() => {
                      checkAvailabilityOnClick();
                      setShowPopOver(false);
                    }}
                    text={t("trips.myTrips.itinerary.step.addToItinerary.submit.apply")}
                  />
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
                key="viator-tour-info"
              >
                <SvgIcons.Avatar />
                {personsCategories
                  .filter((p) => p.count !== 0)
                  .map((personsCategory, index, self) => {
                    const comma = index + 1 !== self.length ? "," : "";
                    if (personsCategory.ageBand === "CHILD" && personsCategory.count > 1) {
                      //Children Edge case
                      return (
                        <span key={`${personsCategory.ageBand}-${personsCategory.count}-${index}-c`}>
                          {personsCategory.count} {t("trips.toursAndTickets.children.label")}
                          {comma}
                        </span>
                      );
                    } else if (personsCategory.count > 1) {
                      //e.g Adults
                      return (
                        <span key={`${personsCategory.ageBand}-${personsCategory.count}-${index}-i`}>
                          {personsCategory.count} {personsCategory.ageBand[0] + personsCategory.ageBand.toLowerCase().slice(1)}s{comma}
                        </span>
                      );
                    }
                    //e.g Adult
                    return (
                      <span key={`${personsCategory.ageBand}-${personsCategory.count}-${index}-a`}>
                        {personsCategory.count} {personsCategory.ageBand[0] + personsCategory.ageBand.toLowerCase().slice(1)}
                        {comma}
                      </span>
                    );
                  })}
              </div>
            </CustomPopover>
          </ul>
          {showWarningMessage ? (
            <Notification
              type="warning"
              positionX="center"
              positionY="top"
              title={t("trips.myTrips.localExperiences.tourDetails.maxTravelerAmountReached")}
              message={t("trips.myTrips.localExperiences.tourDetails.pleaseLowerTheTravelerCount")}
              onClose={() => {
                setShowWarningMessage(false);
              }}
              closeMs={3500}
            />
          ) : null}

          {showAdultRequiredWarning && (
            <Notification
              type="warning"
              positionX="center"
              positionY="top"
              title={t("trips.myTrips.localExperiences.tourDetails.adultRequired")}
              message={t("trips.myTrips.localExperiences.tourDetails.pleaseAddAtLeastOneAdult")}
              onClose={() => {
                setShowAdultRequiredWarning(false);
              }}
              closeMs={35000}
            />
          )}

          <Button
            disabled={isButtonDisabled}
            className={classes.checkAvailabilityButton}
            onClick={() => {
              checkAvailabilityOnClick();
            }}
            text={t("trips.myTrips.localExperiences.tourDetails.checkAvailability")}
          />
        </>
      )}
    </div>
  );
};

export default ViatorTourInfoForm;
