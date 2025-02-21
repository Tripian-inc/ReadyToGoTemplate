import Model, { helper, Providers } from "@tripian/model";

export type Validate = {
  isValid: boolean;
  message?: string;
};

export const initialValidate: Validate = { isValid: false, message: undefined };

const validateContactDetails = (
  formData: { bookerInfo: Providers.Viator.BookerInfo; communication: Providers.Viator.Communication },
  minLength: number,
  maxLength: number,
  t: (value: Model.TranslationKey) => string
): Validate[] => {
  const result: Validate[] = [];
  result.push({ isValid: formData.bookerInfo.firstName.trim() !== "", message: t("trips.myTrips.localExperiences.tourDetails.pleaseEnterYourFirstName") });
  result.push({ isValid: formData.bookerInfo.lastName.trim() !== "", message: t("trips.myTrips.localExperiences.tourDetails.pleaseEnterYourLastName") });

  let emailInvalidMessage = emailValidation(formData.communication.email, t);
  result.push({ isValid: emailInvalidMessage === undefined, message: emailInvalidMessage });

  const phoneNumberInvalidMessage = validatePhoneForE164(formData.communication.phone, minLength, maxLength, t);
  result.push({ isValid: phoneNumberInvalidMessage === undefined, message: phoneNumberInvalidMessage });
  return result;
};

const validatePaymentDetails = (zipCode: string, t: (value: Model.TranslationKey) => string): Validate[] => {
  const result: Validate[] = [];
  const zipCodeInvalidMessage = validateZipCode(zipCode, t);
  result.push({ isValid: zipCodeInvalidMessage === undefined, message: zipCodeInvalidMessage });
  return result;
};

const emailValidation = (email: string, t: (value: Model.TranslationKey) => string): string | undefined => {
  if (email.trim() === "") return t("trips.myTrips.localExperiences.tourDetails.pleaseEnterYourEmail");

  const emailValid = helper.emailFormatValid(email);
  if (!emailValid) return t("trips.myTrips.localExperiences.tourDetails.emailIsInvalid");
  return undefined;
};

const validatePhoneForE164 = (phoneNumber: string, minLength: number, maxLength: number, t: (value: Model.TranslationKey) => string) => {
  if (phoneNumber === "") return t("trips.myTrips.localExperiences.tourDetails.pleaseEnterYourPhoneNumber");
  const regEx = /^\+?[1-9]\d{1,14}$/;
  if (regEx.test(phoneNumber) === false) return t("trips.myTrips.localExperiences.tourDetails.phoneNumberIsInvalid");
  if (phoneNumber.length < minLength) return t("trips.myTrips.localExperiences.tourDetails.phoneNumberIsInvalid");
  if (phoneNumber.length > maxLength) return t("trips.myTrips.localExperiences.tourDetails.phoneNumberIsInvalid");
  return undefined;
};

const validateZipCode = (zipCode: string, t: (value: Model.TranslationKey) => string) => {
  if (zipCode === "") return t("trips.myTrips.localExperiences.tourDetails.zipCodeisRequired");
  if (zipCode.length < 3) return t("trips.myTrips.localExperiences.tourDetails.zipCodeMin3Char");
  if (zipCode.length > 9) return t("trips.myTrips.localExperiences.tourDetails.zipCodeMax9Char");
  return undefined;
};

export { validateContactDetails, validatePaymentDetails };
