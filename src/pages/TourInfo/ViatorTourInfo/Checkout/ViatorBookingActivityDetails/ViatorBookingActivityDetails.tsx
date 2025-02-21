import Model, { Providers } from "@tripian/model";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Button, Dropdown } from "@tripian/react";
import isoLanguages from "./isoLanguages";
import TravelSummary from "../TravelSummary/TravelSummary";
import ViatorBookingQuestions from "./ViatorBookingQuestions/ViatorBookingQuestions";

interface IViatorBookingActivityDetails {
  tourName: string;
  tourImage: string;
  travelDate?: string;
  travelHour?: string;
  travelPrice?: number;
  active: boolean;
  bookingQuestions?: Providers.Viator.BookingQuestion[];
  questionAnswers?: Providers.Viator.BookingQuestionAnswer[];
  travelerCount: number;
  languageGuides?: Providers.Viator.LanguageGuide[];
  logistics?: Providers.Viator.Logistics;
  isEditable: boolean;
  locations: Providers.Viator.GroupedLocations;
  cancellationInfo?: string;
  flags?: string[];
  pickupIncluded: boolean;
  handleEditActivityDetails: () => void;
  clicked: ({
    bookingQuestionAnswers,
    languageGuide,
  }: {
    bookingQuestionAnswers: Providers.Viator.BookingQuestionAnswer[];
    languageGuide?: Providers.Viator.LanguageGuide;
  }) => void;
  t: (value: Model.TranslationKey) => string;
}

const ViatorBookingActivityDetails: React.FC<IViatorBookingActivityDetails> = ({
  tourName,
  tourImage,
  travelDate,
  travelHour,
  travelPrice,
  active,
  bookingQuestions,
  questionAnswers,
  travelerCount,
  languageGuides,
  logistics,
  isEditable,
  locations,
  cancellationInfo,
  flags,
  pickupIncluded,
  handleEditActivityDetails,
  clicked,
  t,
}) => {
  moment.locale(window.twindow.langCode);

  const [languageGuide, setLanguageGuide] = useState<Providers.Viator.LanguageGuide>({ type: "", language: "" });
  const [bookingQuestionAnswers, setBookingQuestionAnswers] = useState<Providers.Viator.BookingQuestionAnswer[]>(questionAnswers || []);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Validation function
  const validateInput = (question: Providers.Viator.BookingQuestion, value: string | number): string | null => {
    if (question.required === "MANDATORY" && !value) {
      return `${question.label} ${t("trips.myTrips.localExperiences.tourDetails.isRequired")}.`;
    }
    if (question.type === "STRING" && typeof value === "string" && value.length > question.maxLength) {
      return `${t("trips.myTrips.localExperiences.tourDetails.characterLimitExceeded")}. (${t("trips.myTrips.localExperiences.tourDetails.max")}: ${question.maxLength})`;
    }
    if (question.type === "NUMBER_AND_UNIT" && isNaN(Number(value))) {
      return `${question.label} ${t("trips.myTrips.localExperiences.tourDetails.mustBeAValidNumber")}.`;
    }
    if (question.type === "TIME") {
      if (!moment(value, "HH:mm", true).isValid()) {
        return `${question.label} ${t("trips.myTrips.localExperiences.tourDetails.mustBeAValidTime")}.`;
      }
    }

    if (question.type === "LOCATION_REF_OR_FREE_TEXT") {
      if (value === "") {
        return `${question.label} ${t("trips.myTrips.localExperiences.tourDetails.isRequired")}.`;
      }
      if (typeof value === "string" && value.length > question.maxLength) {
        return `${t("trips.myTrips.localExperiences.tourDetails.characterLimitExceeded")}. (${t("trips.myTrips.localExperiences.tourDetails.max")}: ${question.maxLength})`;
      }
    }
    return null; // No validation error
  };

  // Automatically preselect the first allowed answer for questions that have allowed answers for each traveler
  useEffect(() => {
    const newAnswers = [...bookingQuestionAnswers];

    // Loop through each traveler and each question
    if (bookingQuestions && bookingQuestions.length > 0) {
      // PER_TRAVELER
      for (let travelerNum = 1; travelerNum <= travelerCount; travelerNum++) {
        bookingQuestions?.forEach((question) => {
          if (question.type === "STRING" && question.allowedAnswers && question.allowedAnswers.length && question.group === "PER_TRAVELER") {
            const existingAnswerIndex = newAnswers.findIndex((answer) => answer.question === question.id && answer.travelerNum === travelerNum);

            // If the question has no answer for this traveler yet, set the first allowed answer
            if (existingAnswerIndex === -1) {
              newAnswers.push({
                question: question.id,
                answer: question.allowedAnswers[0], // Set the first allowed answer
                travelerNum: travelerNum, // Set the traveler number
              });
            }
          }
        });
      }

      const pickupPointQuestionIndex = bookingQuestions.findIndex((q) => q.id === "PICKUP_POINT");
      if (pickupPointQuestionIndex > -1 && !pickupIncluded) {
        newAnswers.push({
          question: "PICKUP_POINT",
          answer: "MEET_AT_DEPARTURE_POINT",
          unit: "LOCATION_REFERENCE",
        });
      }

      // PER_BOOKING pickup location
      // bookingQuestions?.forEach((question) => {
      // if (question.type === "LOCATION_REF_OR_FREE_TEXT" && question.group === "PER_BOOKING") {
      //   const existingAnswerIndex = newAnswers.findIndex((answer) => answer.question === question.id);
      //   // If no answer exists and allowCustomTravelerPickup is false, select the default location
      //   if (existingAnswerIndex === -1 && logistics?.travelerPickup && !logistics.travelerPickup.allowCustomTravelerPickup) {
      //     const defaultPickupLocation = logistics.travelerPickup.locations?.find((loc) => loc.pickupType === "OTHER");
      //     // If a default pickup location is found, preselect it
      //     if (defaultPickupLocation) {
      //       newAnswers.push({
      //         question: question.id,
      //         answer: defaultPickupLocation.location.ref,
      //         unit: "LOCATION_REFERENCE",
      //       });
      //     }
      //   }
      // }
      // if (question.type === "STRING" && question.group === "PER_BOOKING" && question.allowedAnswers && question.allowedAnswers.length) {
      //   const existingAnswerIndex = newAnswers.findIndex((answer) => answer.question === question.id);
      //   if (existingAnswerIndex === -1) {
      //     newAnswers.push({
      //       question: question.id,
      //       answer: question.allowedAnswers[0],
      //     });
      //   }
      // }
      // });

      if (newAnswers.length !== bookingQuestionAnswers.length) {
        setBookingQuestionAnswers(newAnswers); // Only update the state if there are changes
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingQuestions, travelerCount]);

  // const otherLocation = useMemo(
  //   () => logistics?.travelerPickup.locations?.find((l) => l.pickupType === "HOTEL" || l.pickupType === "LOCATION" || l.pickupType === "OTHER"),
  //   [logistics?.travelerPickup.locations]
  // );

  // useEffect(() => {
  //   if (bookingQuestions && bookingQuestions.find((a) => a.id === "TRANSFER_ARRIVAL_MODE")) {
  //     const requiredPrefixes = ["TRANSFER_AIR_ARRIVAL", "TRANSFER_PORT_ARRIVAL", "TRANSFER_RAIL_ARRIVAL"];
  //     const allPrefixesExist = requiredPrefixes.every((prefix) => bookingQuestions.some((q) => q.id.startsWith(prefix)));

  //     if (!allPrefixesExist) {
  //       if (otherLocation) {
  //         handleInputChange("TRANSFER_ARRIVAL_MODE", "OTHER");
  //       }
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Set default language guide to the first option
  useEffect(() => {
    if (languageGuides && languageGuides.length > 0 && !languageGuide.language) {
      setLanguageGuide(languageGuides[0]); // Set the first language guide as default
    }
  }, [languageGuides, languageGuide]);

  const handleInputChange = (id: string, value: any, travelerNum?: number, unit?: string) => {
    setBookingQuestionAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex((answer) => answer.question === id && (travelerNum ? answer.travelerNum === travelerNum : true));

      const newAnswer: Providers.Viator.BookingQuestionAnswer = {
        question: id,
        answer: value,
        ...(unit && { unit }), // Add unit if provided
        ...(travelerNum && { travelerNum }), // Add travelerNum if provided
      };

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      }

      return [...prev, newAnswer];
    });

    // Perform validation and set validation error
    const question = bookingQuestions?.find((q) => q.id === id);
    if (question) {
      const validationError = validateInput(question, value);
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [id]: validationError || "", // Set validation error for the current input or remove it if valid
      }));
    }
  };

  const handleNextClick = () => {
    // Re-run validation for all questions
    const newValidationErrors: { [key: string]: string } = {};
    bookingQuestions?.forEach((question) => {
      const answer = bookingQuestionAnswers.find((answer) => answer.question === question.id)?.answer;
      const validationError = validateInput(question, answer || "");
      if (validationError) {
        newValidationErrors[question.id] = validationError;
      }
    });

    setValidationErrors(newValidationErrors);

    // If there are no validation errors, proceed with the clicked function
    // if (Object.keys(newValidationErrors).length === 0) {
    clicked({
      bookingQuestionAnswers: bookingQuestionAnswers as Providers.Viator.BookingQuestionAnswer[],
      languageGuide: languageGuides && languageGuides.length > 0 ? languageGuide : undefined,
    });
    // }
  };

  const handleArrivalModeChange = (newArrivalMode: string) => {
    const arrivalModeRelatedQuestions: { [key: string]: string[] } = {
      AIR: ["TRANSFER_AIR_ARRIVAL_AIRLINE", "TRANSFER_AIR_ARRIVAL_FLIGHT_NO", "TRANSFER_ARRIVAL_TIME", "TRANSFER_ARRIVAL_DROP_OFF", "PICKUP_POINT"],
      RAIL: ["TRANSFER_RAIL_ARRIVAL_LINE", "TRANSFER_RAIL_ARRIVAL_STATION", "TRANSFER_ARRIVAL_TIME", "TRANSFER_ARRIVAL_DROP_OFF"],
      SEA: ["TRANSFER_PORT_ARRIVAL_TIME", "TRANSFER_PORT_CRUISE_SHIP", "TRANSFER_ARRIVAL_DROP_OFF", "PICKUP_POINT"],
      OTHER: ["PICKUP_POINT"],
    };
    setBookingQuestionAnswers((prevAnswers) => prevAnswers.filter((answer) => !arrivalModeRelatedQuestions[newArrivalMode].includes(answer.question)));
  };

  const handleDepartureModeChange = (newDepartureMode: string) => {
    const departureModeRelatedQuestions: { [key: string]: string[] } = {
      AIR: ["TRANSFER_AIR_DEPARTURE_AIRLINE", "TRANSFER_AIR_DEPARTURE_FLIGHT_NO", "TRANSFER_DEPARTURE_TIME", "TRANSFER_DEPARTURE_PICKUP"],
      RAIL: ["TRANSFER_RAIL_DEPARTURE_LINE", "TRANSFER_RAIL_DEPARTURE_STATION", "TRANSFER_DEPARTURE_TIME", "TRANSFER_DEPARTURE_PICKUP"],
      SEA: ["TRANSFER_PORT_DEPARTURE_TIME", "TRANSFER_PORT_CRUISE_SHIP", "TRANSFER_DEPARTURE_PICKUP"],
      OTHER: [],
    };
    setBookingQuestionAnswers((prevAnswers) => prevAnswers.filter((answer) => !departureModeRelatedQuestions[newDepartureMode].includes(answer.question)));
  };

  // Function to get language name
  const getLanguageName = (code: string) => {
    const language = isoLanguages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  const renderPrimaryTravelerAnswers = useMemo(() => {
    const primaryTravelerNum = 1; // We'll use the first traveler only
    if (bookingQuestionAnswers.length > 0 && bookingQuestions && bookingQuestions.length > 0) {
      return (
        <div className="col col12 mb0">
          <h2 className="my2 font-bold text-base">{t("trips.myTrips.localExperiences.tourDetails.primaryTraveler")}</h2>
          {bookingQuestionAnswers
            .filter((answer) => answer.travelerNum === primaryTravelerNum)
            .map((answer, index) => {
              const question = bookingQuestions.find((q) => q.id === answer.question);
              return (
                <div key={index} className="col col12 flex items-center gap-2 mb1 pl0">
                  <h4 className="my2 font-bold text-[#808080]">{question?.label || "Question"}:</h4>
                  <p>{answer.answer}</p>
                </div>
              );
            })}
        </div>
      );
    }
    return null; // No answers to display
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingQuestionAnswers, bookingQuestions]);

  if (active) {
    return (
      <div className="row p5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
        <div className="col col12 my4 flex items-center gap-2">
          <div className="rounded-full border-2 w-6 h-6 flex items-center justify-center border-black bg-black text-white text-sm">2</div>
          <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.activityDetails")}</h3>
        </div>
        <TravelSummary
          tourName={tourName}
          tourImage={tourImage}
          travelerCount={travelerCount}
          travelDate={travelDate}
          travelHour={travelHour}
          travelPrice={travelPrice}
          cancellationInfo={cancellationInfo}
          flags={flags}
          showPrice={false}
          t={t}
        />
        <hr className="my-2 w-full" style={{ opacity: 0.6 }} />
        <ViatorBookingQuestions
          bookingQuestions={bookingQuestions}
          bookingQuestionAnswers={bookingQuestionAnswers}
          locations={locations}
          logistics={logistics}
          travelerCount={travelerCount}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
          arrivalMode={bookingQuestionAnswers.find((a) => a.question === "TRANSFER_ARRIVAL_MODE")?.answer}
          departureMode={bookingQuestionAnswers.find((a) => a.question === "TRANSFER_DEPARTURE_MODE")?.answer}
          pickupIncluded={pickupIncluded}
          handleArrivalModeChange={handleArrivalModeChange}
          handleDepartureModeChange={handleDepartureModeChange}
          t={t}
        />

        {languageGuides && languageGuides.length > 0 && (
          <div className="col col12 m0 px-4">
            <h4 className="pl3">{t("trips.myTrips.localExperiences.tourDetails.languageGuides")}</h4>
            <div className="col col12 my2">
              <Dropdown
                id="languageGuideDropdown"
                options={languageGuides.map((guide) => ({
                  value: `${guide.language}_${guide.type}`,
                  label: `${getLanguageName(guide.language)} - ${guide.type.charAt(0).toUpperCase() + guide.type.slice(1).toLowerCase()}`,
                }))}
                defaultValue={`${languageGuide.language}_${languageGuide.type}`}
                selectChange={(value) => {
                  const [selectedLanguage, selectedType] = value.toString().split("_");
                  const selectedGuide = languageGuides.find((guide) => guide.language === selectedLanguage && guide.type === selectedType);
                  if (selectedGuide) {
                    setLanguageGuide(selectedGuide);
                  }
                }}
                skippable={false}
                disabled={false}
              />
            </div>
          </div>
        )}

        <div className="col col12 center mt5">
          <Button onClick={handleNextClick} text={t("trips.myTrips.localExperiences.tourDetails.next")} color="primary" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="row px-5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
        <div className="col col12 my4 flex items-center gap-2">
          <div className="rounded-full border-[1px] w-5 h-5 flex items-center justify-center border-black text-sm">2</div>
          <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.activityDetails")}</h3>
        </div>
        {isEditable && (
          <div className="absolute right-4 top-3 border-none w-[35px] h-[35px] cursor-pointer font-medium">
            <button className="hover:underline" onClick={() => handleEditActivityDetails()}>
              {t("trips.myTrips.localExperiences.tourDetails.edit")}
            </button>
          </div>
        )}
        <TravelSummary
          tourName={tourName}
          tourImage={tourImage}
          travelerCount={travelerCount}
          travelDate={travelDate}
          travelHour={travelHour}
          travelPrice={travelPrice}
          cancellationInfo={cancellationInfo}
          flags={flags}
          showPrice={false}
          t={t}
        />
        <hr className="my-2 w-full" style={{ opacity: 0.6 }} />
        {renderPrimaryTravelerAnswers}
        {renderPrimaryTravelerAnswers !== null && <hr className="my-2 w-full" style={{ opacity: 0.6 }} />}
        {languageGuide.language !== "" && (
          <div className="col col12 mb0">
            <h2 className="my2 font-bold text-base">{t("trips.myTrips.localExperiences.tourDetails.otherDetails")}</h2>
            <div className="flex items-center gap-2 mb1 pl0 mx-4">
              <h4 className="my2 font-bold text-[#808080]">{t("trips.myTrips.localExperiences.tourDetails.tourLanguage")}:</h4>
              <p> {`${getLanguageName(languageGuide.language)} - ${languageGuide.type.charAt(0).toUpperCase() + languageGuide.type.slice(1).toLowerCase()}`}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default ViatorBookingActivityDetails;
