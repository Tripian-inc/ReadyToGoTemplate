import Model from "@tripian/model";

type QuestionDetail = {
  question: string;
  description: string;
  mandatory: boolean;
  inputType: "text" | "number" | "date";
  structureType: "value" | "direct";
  translationKey: Model.TranslationKey;
};

// Booking questions mapping with updated translation keys
const bookingQuestionMapping: { [key: string]: QuestionDetail[] } = {
  booking_child_safety_seat: [
    {
      question: "booking_child_safety_seat",
      description: "Booking child safety seat value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingChildSafetySeat",
    },
  ],
  booking_cruise_details: [
    {
      question: "booking_cruise_details",
      description: "Booking cruise details value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingCruiseDetails",
    },
  ],
  booking_customer_accommodation: [
    {
      question: "booking_customer_accommodation",
      description: "Booking accommodation / hotel value.",
      mandatory: true,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingCustomerAccommodation",
    },
  ],
  booking_drop_off_address: [
    {
      question: "booking_drop_off_address",
      description: "Booking drop-off address value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingDropOffAddress",
    },
  ],
  booking_flight_details: [
    {
      question: "flight_number",
      description: "Flight number for the booking.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.flightNumber",
    },
    {
      question: "time_of_arrival",
      description: "Time of arrival for the flight.",
      mandatory: true,
      inputType: "date",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.timeOfArrival",
    },
  ],
  booking_medical_conditions: [
    {
      question: "booking_medical_conditions",
      description: "Booking medical conditions value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingMedicalConditions",
    },
  ],
  booking_mobility_issues: [
    {
      question: "booking_mobility_issues",
      description: "Booking mobility issues value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingMobilityIssues",
    },
  ],
  booking_shipping_address: [
    {
      question: "booking_shipping_address",
      description: "Booking shipping address value.",
      mandatory: true,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingShippingAddress",
    },
  ],
  booking_wheelchair: [
    {
      question: "booking_wheelchair",
      description: "Booking wheelchair value.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.bookingWheelchair",
    },
  ],
};

// Booking questions helper function
export const getBookingQuestionDetails = (questionType: string, t: (value: Model.TranslationKey) => string): QuestionDetail[] => {
  return (bookingQuestionMapping[questionType] || []).map((detail) => ({
    ...detail,
    description: t(detail.translationKey),
  }));
};

export const formatBookingAnswer = (questionType: string, answer: any, t: (value: Model.TranslationKey) => string) => {
  const questionDetails = getBookingQuestionDetails(questionType, t)[0];
  return questionDetails.structureType === "value" ? { value: answer } : answer;
};

// Participant questions mapping with updated translation keys
const participantQuestionMapping: { [key: string]: QuestionDetail[] } = {
  traveler_dietary_restrictions: [
    {
      question: "traveler_dietary_restrictions",
      description: "Participant dietary restrictions.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerDietaryRestrictions",
    },
  ],
  traveler_diving_level: [
    {
      question: "traveler_diving_level",
      description: "Participant diving level.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerDivingLevel",
    },
  ],
  traveler_driver_license: [
    {
      question: "traveler_driver_license",
      description: "Participant's driver's license information.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerDriverLicense",
    },
  ],
  traveler_shoe_size: [
    {
      question: "amount",
      description: "Participant shoe size amount.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.amountShoe",
    },
    {
      question: "unit",
      description: "Participant shoe size unit.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.unitShoe",
    },
  ],
  traveler_skill_level: [
    {
      question: "traveler_skill_level",
      description: "Participant skill level.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerSkillLevel",
    },
  ],
  traveler_age: [
    {
      question: "traveler_age",
      description: "Participant age.",
      mandatory: false,
      inputType: "number",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerAge",
    },
  ],
  traveler_children_age: [
    {
      question: "traveler_children_age",
      description: "Child participant age.",
      mandatory: false,
      inputType: "number",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerChildrenAge",
    },
  ],
  traveler_date_of_birth: [
    {
      question: "traveler_date_of_birth",
      description: "Participant's date of birth (format: YYYY-MM-DD).",
      mandatory: false,
      inputType: "date",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerDateOfBirth",
    },
  ],
  traveler_height: [
    {
      question: "amount",
      description: "Participant height amount.",
      mandatory: true,
      inputType: "number",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.amountHeight",
    },
    {
      question: "unit",
      description: "Participant height unit.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.unitHeight",
    },
  ],
  traveler_id_details: [
    {
      question: "traveler_id_details",
      description: "Participant ID details.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerIdDetails",
    },
  ],
  traveler_id_number: [
    {
      question: "traveler_id_number",
      description: "Participant ID number.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerIdNumber",
    },
  ],
  traveler_name: [
    {
      question: "first_name",
      description: "Participant's first name.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerFirstName",
    },
    {
      question: "last_name",
      description: "Participant's last name.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerLastName",
    },
  ],
  traveler_passport_details: [
    {
      question: "traveler_passport_details",
      description: "Participant passport details.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerPassportDetails",
    },
  ],
  traveler_passport_number: [
    {
      question: "traveler_passport_number",
      description: "Participant passport number.",
      mandatory: false,
      inputType: "text",
      structureType: "value",
      translationKey: "trips.myTrips.localExperiences.tourDetails.travelerPassportNumber",
    },
  ],
  traveler_weight: [
    {
      question: "amount",
      description: "Participant weight amount.",
      mandatory: true,
      inputType: "number",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.amountWeight",
    },
    {
      question: "unit",
      description: "Participant weight unit.",
      mandatory: true,
      inputType: "text",
      structureType: "direct",
      translationKey: "trips.myTrips.localExperiences.tourDetails.unitWeight",
    },
  ],
};

// Participant questions helper function
export const getParticipantQuestionDetails = (questionType: string, t: (value: Model.TranslationKey) => string): QuestionDetail[] => {
  return (participantQuestionMapping[questionType] || []).map((detail) => ({
    ...detail,
    description: t(detail.translationKey),
  }));
};

export const formatParticipantAnswer = (questionType: string, answer: any, t: (value: Model.TranslationKey) => string) => {
  const questionDetails = getParticipantQuestionDetails(questionType, t)[0];
  return questionDetails.structureType === "value" ? { value: answer } : answer;
};
