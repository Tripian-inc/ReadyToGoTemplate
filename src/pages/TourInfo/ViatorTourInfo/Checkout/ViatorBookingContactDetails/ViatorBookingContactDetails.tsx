import React, { useEffect, useState } from "react";
import moment from "moment";
import { TextField, Button, ErrorMessage, RSelect } from "@tripian/react";
import numberList from "./numberList";
import { initialValidate, Validate, validateContactDetails } from "../helper/validation";
import Model, { Providers } from "@tripian/model";

interface IViatorBookingContactDetails {
  active: boolean;
  handleEditContactDetails: () => void;
  user?: Model.User;
  bookerInfo: Providers.Viator.BookerInfo;
  communication: Providers.Viator.Communication;
  clicked: ({ bookerInfo, communication }: { bookerInfo: Providers.Viator.BookerInfo; communication: Providers.Viator.Communication }) => void;
  t: (value: Model.TranslationKey) => string;
}

const ViatorBookingContactDetails: React.FC<IViatorBookingContactDetails> = ({ active, user, bookerInfo, communication, handleEditContactDetails, clicked, t }) => {
  moment.locale(window.twindow.langCode);

  const extractPhoneNumber = (phone: string, countryCode: string) => {
    if (phone.startsWith(countryCode)) {
      return phone.replace(countryCode, "");
    }
    return phone;
  };

  const [selectedCountry, setSelectedCountry] = useState(numberList[0]);
  const [validate, setValidate] = useState<Validate[]>([initialValidate, initialValidate, initialValidate, initialValidate]);
  const [isContinueClicked, setIsContinueClicked] = useState<boolean>(false);

  const [formData, setFormData] = useState<{ bookerInfo: Providers.Viator.BookerInfo; communication: Providers.Viator.Communication }>({
    bookerInfo: {
      firstName: user?.firstName || bookerInfo.firstName,
      lastName: user?.lastName || bookerInfo.lastName,
    },
    communication: {
      email: user?.email || communication.email,
      phone: extractPhoneNumber(communication.phone, selectedCountry.internationalPhonePrefix),
    },
  });

  useEffect(() => {
    const validate = validateContactDetails(formData, selectedCountry.minLength, selectedCountry.maxLength, t);
    setValidate(validate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, selectedCountry]);

  const handleInputChange = (key: keyof Providers.Viator.BookerInfo | keyof Providers.Viator.Communication, value: string) => {
    setFormData((prevFormData) => {
      if (key === "firstName" || key === "lastName") {
        return {
          ...prevFormData,
          bookerInfo: {
            ...prevFormData.bookerInfo,
            [key]: value,
          },
        };
      } else {
        return {
          ...prevFormData,
          communication: {
            ...prevFormData.communication,
            [key]: value,
          },
        };
      }
    });
  };

  const handlePhoneInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      handleInputChange("phone", value); // Only allow numbers
    }
  };

  // const isButtonDisabled = Object.values(formData.bookerInfo).some((x) => x === null || x === "") || Object.values(formData.communication).some((x) => x === null || x === "");

  const handleNextClick = () => {
    setIsContinueClicked(true);
    if (validate.every((valid) => valid.isValid)) {
      clicked({
        ...formData,
        communication: {
          ...formData.communication,
          phone: selectedCountry.internationalPhonePrefix + formData.communication.phone, // Send phone with country code
        },
      });
    }
  };

  if (active) {
    return (
      <div className="row p5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
        <div className="col col12 my4 flex items-center gap-2 !p-0">
          <div className="rounded-full border-2 w-6 h-6 flex items-center justify-center border-black bg-black text-white text-sm">1</div>
          <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.contactDetails")}</h3>
        </div>
        <div className="col col6">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.firstName")}</h4>
          <TextField
            type="text"
            name="first_name"
            value={formData.bookerInfo.firstName}
            onChange={(event) => handleInputChange("firstName", event.target.value)}
            autocomplete="on"
          />
          {!validate[0].isValid && isContinueClicked && validate[0].message && <ErrorMessage message={validate[0].message} />}
        </div>
        <div className="col col6">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.lastName")}</h4>
          <TextField type="text" name="last_name" value={formData.bookerInfo.lastName} onChange={(event) => handleInputChange("lastName", event.target.value)} autocomplete="on" />
          {!validate[1].isValid && isContinueClicked && validate[1].message && <ErrorMessage message={validate[1].message} />}
        </div>

        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.email")}</h4>
          <TextField type="email" name="email" value={formData.communication.email} onChange={(event) => handleInputChange("email", event.target.value)} autocomplete="on" />
          {!validate[2].isValid && isContinueClicked && validate[2].message && <ErrorMessage message={validate[2].message} />}
        </div>
        <div className="col col12">
          <h4 className="my2">{t("trips.myTrips.localExperiences.tourDetails.phoneNumber")}</h4>
          <div className="flex gap-2">
            <RSelect
              options={numberList.map((tz) => ({
                value: tz.internationalPhonePrefix,
                label: `${tz.countryName} (${tz.internationalPhonePrefix})`,
              }))}
              selectedOptionValue={selectedCountry.internationalPhonePrefix}
              onSelectedOptionChange={(selectedOption) => {
                const country = numberList.find((c) => c.internationalPhonePrefix === selectedOption.value);
                setSelectedCountry(country!);
              }}
            />
            <TextField
              type="text"
              name="phone_number"
              value={formData.communication.phone}
              onChange={(event) => handlePhoneInputChange(event.target.value)}
              placeholder={t("trips.myTrips.localExperiences.tourDetails.phoneNumber")}
              autocomplete="on"
            />
          </div>
          {!validate[3].isValid && isContinueClicked && validate[3].message && <ErrorMessage message={validate[3].message} />}
        </div>

        <div className="col col12 center mt5">
          <Button onClick={handleNextClick} text={t("trips.myTrips.localExperiences.tourDetails.next")} color="primary" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="row px-5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
        <div className="col col12 my4 flex items-center gap-2">
          <div className="rounded-full border-[1px] w-5 h-5 flex items-center justify-center border-black text-sm">1</div>
          <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.contactDetails")}</h3>
        </div>
        <div className="absolute right-4 top-3 border-none w-[35px] h-[35px] cursor-pointer font-medium">
          <button className="hover:underline" onClick={() => handleEditContactDetails()}>
            {t("trips.myTrips.localExperiences.tourDetails.edit")}
          </button>
        </div>

        <div className="col col12 mb2">
          <p className="font-bold">{`${bookerInfo?.firstName} ${bookerInfo?.lastName}`}</p>
        </div>
        <div className="col col12 flex items-center gap-2 mb0">
          <h4 className="my2 font-bold">{t("trips.myTrips.localExperiences.tourDetails.email")}:</h4>
          <p>{communication?.email}</p>
        </div>
        <div className="col col12 flex items-center gap-2 mb2">
          <h4 className="my2 font-bold">{t("trips.myTrips.localExperiences.tourDetails.phoneNumber")}:</h4>
          <p>{communication?.phone}</p>
        </div>
      </div>
    );
  }
};

export default ViatorBookingContactDetails;
