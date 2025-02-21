import Model, { Providers } from "@tripian/model";
import React, { useMemo } from "react";
import moment from "moment";
import { Dropdown, ErrorMessage, TextField } from "@tripian/react";
import PickupPoint from "../PickupPoint/PickupPoint";

interface IViatorBookingQuestions {
  bookingQuestions?: Providers.Viator.BookingQuestion[];
  bookingQuestionAnswers: Providers.Viator.BookingQuestionAnswer[];
  locations: Providers.Viator.GroupedLocations;
  logistics?: Providers.Viator.Logistics;
  travelerCount: number;
  handleInputChange: (id: string, value: any, travelerNum?: number, unit?: string) => void;
  validationErrors: { [key: string]: string };
  arrivalMode?: string;
  departureMode?: string;
  pickupIncluded: boolean;
  handleArrivalModeChange: (newMode: string) => void;
  handleDepartureModeChange: (newMode: string) => void;
  t: (value: Model.TranslationKey) => string;
}

const ViatorBookingQuestions: React.FC<IViatorBookingQuestions> = ({
  bookingQuestions,
  bookingQuestionAnswers,
  locations,
  logistics,
  travelerCount,
  handleInputChange,
  validationErrors,
  arrivalMode,
  departureMode,
  pickupIncluded,
  handleArrivalModeChange,
  handleDepartureModeChange,
  t,
}) => {
  moment.locale(window.twindow.langCode);

  const renderQuestionFieldPerTraveler = (question: Providers.Viator.BookingQuestion, travelerNum?: number) => {
    const questionKey = travelerNum ? `${question.id}_traveler_${travelerNum}` : question.id;
    const error = validationErrors[questionKey];

    if (question.id === "FULL_NAMES_FIRST" || question.id === "FULL_NAMES_LAST" || question.id === "PASSPORT_NATIONALITY" || question.id === "PASSPORT_PASSPORT_NO") {
      return (
        <div className="col col12">
          <h4 className="my2">{question.label}</h4>
          <TextField
            key={questionKey}
            name={questionKey}
            value={bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.answer || ""}
            onChange={(event) => handleInputChange(question.id, event.target.value, travelerNum)}
            placeholder={question.hint}
            max={question.maxLength}
            required={question.required === "MANDATORY"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "AGEBAND") {
      return (
        <div className="col col12">
          <h4 className="my2">{question.label}</h4>
          <Dropdown
            id={questionKey}
            options={question.allowedAnswers!.map((answer) => ({ value: answer, label: answer }))}
            defaultValue={bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.answer || question.allowedAnswers![0]}
            selectChange={(value) => handleInputChange(question.id, value, travelerNum)}
            skippable={false}
            disabled={question.required === "OPTIONAL"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "DATE_OF_BIRTH" || question.id === "PASSPORT_EXPIRY") {
      return (
        <div className="col col12">
          <h4 className="my2">{question.label}</h4>
          <TextField
            key={questionKey}
            type="date"
            name={questionKey}
            value={bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.answer || ""}
            onChange={(event) => handleInputChange(question.id, event.target.value, travelerNum)}
            required={question.required === "MANDATORY"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "HEIGHT" || question.id === "WEIGHT") {
      return (
        <div className="row col col12 p0 m0">
          <h4 className="my2 px3">{question.label}</h4>
          <div key={questionKey} className="col col6">
            <TextField
              name={questionKey}
              value={bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.answer || ""}
              onChange={(event) => handleInputChange(question.id, event.target.value, travelerNum)}
              max={question.maxLength}
              placeholder={question.id.charAt(0).toUpperCase() + question.id.slice(1).toLowerCase()}
              required={question.required === "MANDATORY"}
            />
          </div>
          <div className="col col6">
            <Dropdown
              id={`${questionKey}_unit`}
              options={question.units?.map((unit) => ({ value: unit, label: unit })) || []}
              defaultValue={bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.unit || ""}
              selectChange={(value) =>
                handleInputChange(
                  question.id,
                  bookingQuestionAnswers.find((answer) => answer.question === question.id && answer.travelerNum === travelerNum)?.answer || "",
                  travelerNum,
                  value.toString()
                )
              }
              skippable={false}
              disabled={question.required === "OPTIONAL"}
            />
          </div>
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }
  };

  // const getArrivalDepartureModeOptions = (locations: Array<{ pickupType: string }>) => {
  //   const options: Array<{ value: string; label: string }> = [];

  //   if (locations.some((location) => location.pickupType === "AIRPORT")) {
  //     options.push({ value: "AIR", label: "AIR" });
  //   }

  //   if (locations.some((location) => location.pickupType === "PORT")) {
  //     options.push({ value: "SEA", label: "SEA" });
  //   }

  //   // if (locations.some((location) => location.pickupType === "LOCATION")) {
  //   //   options.push({ value: "RAIL", label: "RAIL" });
  //   // }

  //   if (locations.some((location) => ["HOTEL", "LOCATION"].includes(location.pickupType))) {
  //     options.push({ value: "OTHER", label: "OTHER" });
  //   }

  //   return options;
  // };

  // const arrivalDepartureModeOptions = useMemo(() => {
  //   return getArrivalDepartureModeOptions(logistics?.travelerPickup?.locations || []);
  // }, [logistics?.travelerPickup?.locations]);

  const arrivalModeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    const arrivalModeRelatedQuestions: { [key: string]: string[] } = {
      AIR: ["TRANSFER_AIR_ARRIVAL_AIRLINE", "TRANSFER_AIR_ARRIVAL_FLIGHT_NO", "TRANSFER_ARRIVAL_TIME", "TRANSFER_ARRIVAL_DROP_OFF", "PICKUP_POINT"],
      RAIL: ["TRANSFER_RAIL_ARRIVAL_LINE", "TRANSFER_RAIL_ARRIVAL_STATION", "TRANSFER_ARRIVAL_TIME", "TRANSFER_ARRIVAL_DROP_OFF"],
      SEA: ["TRANSFER_PORT_ARRIVAL_TIME", "TRANSFER_PORT_CRUISE_SHIP", "TRANSFER_ARRIVAL_DROP_OFF", "PICKUP_POINT"],
      OTHER: ["PICKUP_POINT"],
    };

    const hasArrivalQuestions = (mode: string): boolean => {
      return arrivalModeRelatedQuestions[mode].every((questionId) => bookingQuestions?.some((question) => question.id === questionId));
    };

    if (/*logistics?.travelerPickup.locations?.some((location) => location.pickupType === "AIRPORT") && */ hasArrivalQuestions("AIR")) {
      options.push({ value: "AIR", label: "AIR" });
    }

    if (hasArrivalQuestions("RAIL")) {
      options.push({ value: "RAIL", label: "RAIL" });
    }

    if (/*logistics?.travelerPickup.locations?.some((location) => location.pickupType === "PORT") && */ hasArrivalQuestions("SEA")) {
      options.push({ value: "SEA", label: "SEA" });
    }

    if (/*logistics?.travelerPickup.locations?.some((location) => ["HOTEL", "LOCATION"].includes(location.pickupType)) && */ hasArrivalQuestions("OTHER")) {
      options.push({ value: "OTHER", label: "OTHER" });
    }

    return options;
  }, [bookingQuestions]);

  const departureModeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    const departureModeRelatedQuestions: { [key: string]: string[] } = {
      AIR: ["TRANSFER_AIR_DEPARTURE_AIRLINE", "TRANSFER_AIR_DEPARTURE_FLIGHT_NO", "TRANSFER_DEPARTURE_TIME", "TRANSFER_DEPARTURE_PICKUP"],
      RAIL: ["TRANSFER_RAIL_DEPARTURE_LINE", "TRANSFER_RAIL_DEPARTURE_STATION", "TRANSFER_DEPARTURE_TIME", "TRANSFER_DEPARTURE_PICKUP"],
      SEA: ["TRANSFER_PORT_DEPARTURE_TIME", "TRANSFER_PORT_CRUISE_SHIP", "TRANSFER_DEPARTURE_PICKUP"],
      OTHER: [],
    };

    const hasDepartureQuestions = (mode: string): boolean => {
      const relatedQuestions = departureModeRelatedQuestions[mode];
      return relatedQuestions.every((questionId) => bookingQuestions?.some((question) => question.id === questionId));
    };

    if (/*logistics?.travelerPickup.locations?.some((location) => location.pickupType === "AIRPORT") || */ hasDepartureQuestions("AIR")) {
      options.push({ value: "AIR", label: "AIR" });
    }

    if (hasDepartureQuestions("RAIL")) {
      options.push({ value: "RAIL", label: "RAIL" });
    }

    if (/*logistics?.travelerPickup.locations?.some((location) => location.pickupType === "PORT") || */ hasDepartureQuestions("SEA")) {
      options.push({ value: "SEA", label: "SEA" });
    }

    options.push({ value: "OTHER", label: "OTHER" });

    return options;
  }, [bookingQuestions]);

  const renderQuestionFieldPerBooking = (question: Providers.Viator.BookingQuestion) => {
    const error = validationErrors[question.id];

    if (
      question.id === "TRANSFER_ARRIVAL_MODE" &&
      question.allowedAnswers /* &&
      bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_AIR_ARRIVAL")) &&
      bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_PORT_ARRIVAL")) &&
      bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_RAIL_ARRIVAL")) */
    ) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferArrivalMode")}</h4>
          <Dropdown
            id={question.id}
            options={arrivalModeOptions}
            defaultValue={arrivalMode}
            selectChange={(value) => {
              handleArrivalModeChange(value.toString());
              handleInputChange(question.id, value);
            }}
            skippable={false}
            // disabled={question.required === "OPTIONAL"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (
      question.id === "PICKUP_POINT" &&
      pickupIncluded &&
      ((arrivalMode === "AIR" && (logistics?.travelerPickup.locations?.some((l) => l.pickupType === "AIRPORT") || logistics?.travelerPickup.allowCustomTravelerPickup)) ||
        arrivalMode === undefined ||
        (arrivalMode === "SEA" && (logistics?.travelerPickup.locations?.some((l) => l.pickupType === "PORT") || logistics?.travelerPickup.allowCustomTravelerPickup)) ||
        (arrivalMode === "OTHER" && logistics?.travelerPickup.locations?.some((l) => l.pickupType === "HOTEL" || l.pickupType === "LOCATION")))
    ) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.pickupPoint")}</h4>
          <PickupPoint
            locations={locations}
            logistics={logistics}
            selectedMode={arrivalMode}
            selectedAnswer={bookingQuestionAnswers.find((a) => a.question === "PICKUP_POINT")}
            handleInput={(value: any, unit?: string) => handleInputChange(question.id, value, undefined, unit)}
            t={t}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "TRANSFER_AIR_ARRIVAL_AIRLINE" && (arrivalMode === "AIR" || arrivalMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferAirArrivalAirline")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_AIR_ARRIVAL_AIRLINE")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_AIR_ARRIVAL_AIRLINE", event.target.value)}
            placeholder="E.g. United Airlines"
            max={255}
            required
          />
          {/* {error && <ErrorMessage message={error} />} */}
        </div>
      );
    }

    if (question.id === "TRANSFER_AIR_ARRIVAL_FLIGHT_NO" && (arrivalMode === "AIR" || arrivalMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferAirArrivalFlightNumber")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_AIR_ARRIVAL_FLIGHT_NO")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_AIR_ARRIVAL_FLIGHT_NO", event.target.value)}
            placeholder="Enter flight number"
            max={255}
            required
          />
          {/* {error && <ErrorMessage message={error} />} */}
        </div>
      );
    }

    if (question.id === "TRANSFER_RAIL_ARRIVAL_LINE" && (arrivalMode === "RAIL" || arrivalMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferRailArrivalLine")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_RAIL_ARRIVAL_LINE")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_RAIL_ARRIVAL_LINE", event.target.value)}
            placeholder="E.g. Amtrak"
            max={255}
          />
          {/* {error && <ErrorMessage message={error} />} */}
        </div>
      );
    }

    if (question.id === "TRANSFER_RAIL_ARRIVAL_STATION" && (arrivalMode === "RAIL" || arrivalMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferRailArrivalStation")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_RAIL_ARRIVAL_STATION")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_RAIL_ARRIVAL_STATION", event.target.value)}
            placeholder="E.g. Central Station"
            max={255}
          />
          {/* {error && <ErrorMessage message={error} />} */}
        </div>
      );
    }

    if (
      question.id === "TRANSFER_ARRIVAL_DROP_OFF" &&
      ((arrivalMode === "AIR" && (logistics?.travelerPickup.locations?.some((l) => l.pickupType === "AIRPORT") || logistics?.travelerPickup.allowCustomTravelerPickup)) ||
        arrivalMode === "RAIL" ||
        arrivalMode === undefined ||
        (arrivalMode === "SEA" && (logistics?.travelerPickup.locations?.some((l) => l.pickupType === "PORT") || logistics?.travelerPickup.allowCustomTravelerPickup)))
    ) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferArrivalDropOff")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_ARRIVAL_DROP_OFF")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_ARRIVAL_DROP_OFF", event.target.value, undefined, "FREETEXT")}
            placeholder="E.g. Brilliance of the Seas"
            max={255}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((arrivalMode === "AIR" || arrivalMode === "RAIL" || arrivalMode === undefined) && question.id === "TRANSFER_ARRIVAL_TIME") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferArrivalTime")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            type="time"
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_ARRIVAL_TIME")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_ARRIVAL_TIME", event.target.value)}
            required
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "TRANSFER_PORT_ARRIVAL_TIME" && (arrivalMode === "SEA" || arrivalMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferPortArrivalTime")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            type="time"
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_PORT_ARRIVAL_TIME")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_PORT_ARRIVAL_TIME", event.target.value)}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (
      question.id === "TRANSFER_DEPARTURE_MODE" &&
      question.allowedAnswers &&
      (bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_AIR_DEPARTURE")) ||
        bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_PORT_DEPARTURE")) ||
        bookingQuestions?.some((q) => q.id.startsWith("TRANSFER_RAIL_DEPARTURE")))
    ) {
      const options = arrivalMode === "OTHER" ? departureModeOptions : departureModeOptions.filter((q) => q.value !== "OTHER");
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferDepartureMode")}</h4>
          <Dropdown
            id={question.id}
            options={options}
            defaultValue={departureMode}
            selectChange={(value) => {
              handleDepartureModeChange(value.toString());
              handleInputChange(question.id, value);
            }}
            skippable={false}
            // disabled={question.required === "OPTIONAL"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "TRANSFER_AIR_DEPARTURE_AIRLINE" && (departureMode === "AIR" || departureMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferAirDepartureAirline")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_AIR_DEPARTURE_AIRLINE")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_AIR_DEPARTURE_AIRLINE", event.target.value)}
            placeholder="E.g. United Airlines"
            max={255}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "TRANSFER_AIR_DEPARTURE_FLIGHT_NO" && (departureMode === "AIR" || departureMode === undefined)) {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferAirDepartureFlightNumber")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_AIR_DEPARTURE_FLIGHT_NO")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_AIR_DEPARTURE_FLIGHT_NO", event.target.value)}
            placeholder="Enter flight number"
            max={255}
            required
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "AIR" || departureMode === "RAIL" || departureMode === "SEA" || departureMode === undefined) && question.id === "TRANSFER_DEPARTURE_DATE") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferDepartureDate")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            type="date"
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_DEPARTURE_DATE")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_DEPARTURE_DATE", event.target.value)}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "AIR" || departureMode === "RAIL" || departureMode === undefined) && question.id === "TRANSFER_DEPARTURE_TIME") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferDepartureTime")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            type="time"
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_DEPARTURE_TIME")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_DEPARTURE_TIME", event.target.value)}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "AIR" || departureMode === "RAIL" || departureMode === "SEA" || departureMode === undefined) && question.id === "TRANSFER_DEPARTURE_PICKUP") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferDeparturePickup")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_DEPARTURE_PICKUP")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_DEPARTURE_PICKUP", event.target.value, undefined, "FREETEXT")}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((arrivalMode === "SEA" || departureMode === "SEA" || (arrivalMode === undefined && departureMode === undefined)) && question.id === "TRANSFER_PORT_CRUISE_SHIP") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferPortCruiseShip")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_PORT_CRUISE_SHIP")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_PORT_CRUISE_SHIP", event.target.value)}
            placeholder="E.g. Brilliance of the Seas"
            max={255}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "SEA" || departureMode === undefined) && question.id === "TRANSFER_PORT_DEPARTURE_TIME") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferPortDepartureTime")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            type="time"
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_PORT_DEPARTURE_TIME")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_PORT_DEPARTURE_TIME", event.target.value)}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "RAIL" || departureMode === undefined) && question.id === "TRANSFER_RAIL_DEPARTURE_LINE") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferRailDepartureLine")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_RAIL_DEPARTURE_LINE")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_RAIL_DEPARTURE_LINE", event.target.value)}
            placeholder="E.g. Amtrak"
            max={255}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if ((departureMode === "RAIL" || departureMode === undefined) && question.id === "TRANSFER_RAIL_DEPARTURE_STATION") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.transferRailDepartureStation")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === "TRANSFER_RAIL_DEPARTURE_STATION")?.answer || ""}
            onChange={(event) => handleInputChange("TRANSFER_RAIL_DEPARTURE_STATION", event.target.value)}
            placeholder="E.g. Central Station"
            max={255}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    if (question.id === "SPECIAL_REQUIREMENTS") {
      return (
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.questions.specialRequirements")}</h4>
          <TextField
            key={question.id}
            name={question.id}
            value={bookingQuestionAnswers.find((answer) => answer.question === question.id)?.answer || ""}
            onChange={(event) => handleInputChange(question.id, event.target.value)}
            placeholder="e.g. dietary needs, accessibility"
            max={question.maxLength}
            required={question.required === "MANDATORY"}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      );
    }

    return null;
  };

  const perTravelerQuestions = useMemo(() => {
    return bookingQuestions?.filter((question) => question.group === "PER_TRAVELER") || [];
  }, [bookingQuestions]);

  const perBookingQuestions = useMemo(() => {
    return bookingQuestions?.filter((question) => question.group === "PER_BOOKING") || [];
  }, [bookingQuestions]);

  const renderPerTravelerQuestions = (travelerNum: number) => {
    if (perTravelerQuestions && perTravelerQuestions.length > 0) {
      return perTravelerQuestions.map((question) => (
        <div className="col col12 my4" key={`${question.id}_traveler_${travelerNum}`}>
          {renderQuestionFieldPerTraveler(question, travelerNum)}
        </div>
      ));
    }
  };

  const arrivalQuestions = useMemo(() => {
    return bookingQuestions?.filter((question) =>
      [
        "PICKUP_POINT",
        "TRANSFER_AIR_ARRIVAL_AIRLINE",
        "TRANSFER_AIR_ARRIVAL_FLIGHT_NO",
        "TRANSFER_ARRIVAL_DROP_OFF",
        "TRANSFER_ARRIVAL_TIME",
        "TRANSFER_PORT_ARRIVAL_TIME",
        "TRANSFER_PORT_CRUISE_SHIP",
        "TRANSFER_RAIL_ARRIVAL_LINE",
        "TRANSFER_RAIL_ARRIVAL_STATION",
      ].includes(question.id)
    );
  }, [bookingQuestions]);

  const departureQuestions = useMemo(() => {
    return bookingQuestions?.filter((question) =>
      [
        "TRANSFER_AIR_DEPARTURE_AIRLINE",
        "TRANSFER_AIR_DEPARTURE_FLIGHT_NO",
        "TRANSFER_DEPARTURE_DATE",
        "TRANSFER_DEPARTURE_PICKUP",
        "TRANSFER_DEPARTURE_TIME",
        "TRANSFER_PORT_DEPARTURE_TIME",
        "TRANSFER_RAIL_DEPARTURE_LINE",
        "TRANSFER_RAIL_DEPARTURE_STATION",
      ].includes(question.id)
    );
  }, [bookingQuestions]);

  const renderArrivalPerBookingQuestions = () => {
    if (perBookingQuestions && perBookingQuestions.length > 0) {
      return arrivalQuestions?.map((question) => (
        <div key={question.id} className="my4">
          {renderQuestionFieldPerBooking(question)}
        </div>
      ));
    }
  };

  const renderDeparturePerBookingQuestions = () => {
    if (perBookingQuestions && perBookingQuestions.length > 0) {
      return departureQuestions?.map((question) => (
        <div key={question.id} className="my4">
          {renderQuestionFieldPerBooking(question)}
        </div>
      ));
    }
  };

  // const renderPerBookingQuestions = () => {
  //   if (perBookingQuestions && perBookingQuestions.length > 0) {
  //     return perBookingQuestions.map((question) => <>{renderQuestionFieldPerBooking(question)}</>);
  //   }
  // };

  return (
    <>
      {/* Render PER_TRAVELER questions for each traveler */}
      {perTravelerQuestions &&
        perTravelerQuestions.length > 0 &&
        [...Array(travelerCount)].map((_, index) => (
          <div className="col col12 my4" key={`traveler_${index + 1}`}>
            <h3 className="font-bold text-lg">
              {t("trips.myTrips.localExperiences.tourDetails.traveler")} {index + 1}
            </h3>
            {renderPerTravelerQuestions(index + 1)}
            <hr className="my-4" style={{ opacity: 0.6 }} />
          </div>
        ))}

      {pickupIncluded && (
        <>
          {/* Arrival Section */}
          {arrivalQuestions && arrivalQuestions.length > 0 && (
            <div className="col col12">
              <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.questions.arrivalDetails")}</h3>
              {/** Arrival Mode Input */}
              {bookingQuestions
                ?.filter((question) => question.id === "TRANSFER_ARRIVAL_MODE")
                .map((question) => (
                  <div key={question.id} className="my4">
                    {renderQuestionFieldPerBooking(question)}
                  </div>
                ))}
              {renderArrivalPerBookingQuestions()}
              <hr className="my-4" style={{ opacity: 0.6 }} />
            </div>
          )}
          {/* Departure Section */}
          {departureQuestions && departureQuestions.length > 0 && (
            <div className="col col12">
              <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.questions.departureDetails")}</h3>
              {/** Departure Mode Input */}
              {bookingQuestions
                ?.filter((question) => question.id === "TRANSFER_DEPARTURE_MODE")
                .map((question) => (
                  <div key={question.id} className="my4">
                    {renderQuestionFieldPerBooking(question)}
                  </div>
                ))}
              {renderDeparturePerBookingQuestions()}
              <hr className="my-4" style={{ opacity: 0.6 }} />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViatorBookingQuestions;
