import React, { useEffect, useState } from "react";
import loadPayment from "payment";
import { PreLoading, Button, RSelect, ErrorMessage } from "@tripian/react";
import countryList from "./countryList";
import { initialValidate, Validate, validatePaymentDetails } from "../helper/validation";
import classes from "./ViatorBookingPaymentDetails.scss";
import Model from "@tripian/model";

type Props = {
  paymentRef: React.RefObject<HTMLDivElement>;
  paymentSessionToken?: string;
  setPaymentLoading: (loading: boolean) => void;
  onSuccess: (paymentToken: string) => void;
  onError: (error: string) => void;
  t: (value: Model.TranslationKey) => string;
};

const ViatorBookingPaymentDetails: React.FC<Props> = ({ paymentRef, paymentSessionToken, setPaymentLoading, onSuccess, onError, t }) => {
  const [paymentInstance, setPaymentInstance] = useState<any>(null);
  const [country, setCountry] = useState<{ value: string; label: string }>(countryList[0]);
  const [zipCode, setZipCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [validate, setValidate] = useState<Validate[]>([initialValidate]);
  const [isContinueClicked, setIsContinueClicked] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && paymentRef.current) {
      const elementPosition = paymentRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offset = -100;
      window.scrollTo({ top: elementPosition + offset, behavior: "smooth" });
    }
  }, [loading, paymentRef]);

  // Initialize payment iframe
  useEffect(() => {
    const initPaymentIframe = async () => {
      const cardFrameContainer = document.getElementById("card-frame-holder-module");
      if (!cardFrameContainer || !paymentSessionToken) return;

      try {
        const payment = await loadPayment(paymentSessionToken);

        payment.renderCard({
          cardElementContainer: "card-frame-holder-module",
          onFormUpdate: onFormUpdate,
          styling: {
            variables: {
              fontSize: "0.875rem",
              colorInputBackground: "#f5f5f5",
              colorBackground: "#FFFFFF",
              colorPrimaryText: "#000000",
            },
          },
        });

        setPaymentInstance(payment);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        setLoading(false);
        console.error("Error loading payment module:", error);
      }
    };

    if (paymentSessionToken) {
      initPaymentIframe();
    }
  }, [paymentSessionToken]);

  // Form validation
  useEffect(() => {
    const validate = validatePaymentDetails(zipCode, t);
    setValidate(validate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode]);

  const onFormUpdate = (update) => {
    console.log("Form update:", update);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!paymentInstance) {
      console.error("Payment instance is not initialized.");
      return;
    }
    setIsContinueClicked(true);

    if (validate.every((valid) => valid.isValid)) {
      try {
        const bodyData = {
          address: {
            country: country.value,
            postalCode: zipCode,
          },
        };
        const response = await paymentInstance.submitForm(bodyData);
        setPaymentLoading(true);
        setIsButtonDisabled(true);
        onSubmitSuccess(response);
      } catch (error) {
        setPaymentLoading(false);
        onSubmitError(error);
      }
    }
  };

  const onSubmitSuccess = (message) => {
    onSuccess(message.paymentToken);
    setIsButtonDisabled(false);
  };

  const onSubmitError = (error) => {
    onError(error);
    setIsButtonDisabled(false);
    setPaymentLoading(false);
  };

  return (
    <div ref={paymentRef} className="row w-full px-5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
      <div className="w-full">
        <div className="col col12 my4 flex items-center gap-2">
          <div className="rounded-full border-2 w-6 h-6 flex items-center justify-center border-black bg-black text-white text-sm">3</div>
          <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.paymentDetails")}</h3>
        </div>
        {loading && (
          <div className="min-h-[10rem] flex items-center justify-center w-full">
            <PreLoading size="small" />
          </div>
        )}
        <hr className="h-px my-2 border-0" />
        <div className={loading ? "hidden" : "block"}>
          <div id="card-frame-holder-module">{/* Secure iframe will be injected here */}</div>

          {/* Country Dropdown */}
          <div className="mb-4 w-full">
            <div className="mb-2 text-sm font-medium text-black">{t("trips.myTrips.localExperiences.tourDetails.country")}</div>
            <div className={classes.countrySelect}>
              <RSelect options={countryList} selectedOptionValue={country.value} onSelectedOptionChange={(selectedOption) => setCountry(selectedOption)} />
            </div>
          </div>

          {/* Zip Code Input */}
          <div className="mb-2">
            <div className="mb-2 text-sm font-medium text-black">{t("trips.myTrips.localExperiences.tourDetails.zipCode")}</div>
            <input
              type="text"
              value={zipCode}
              className={`w-full py-[0.701rem] px-[0.5rem] border rounded-xl ${
                !validate[0].isValid && isContinueClicked && validate[0].message ? "border-red-[#C40000]" : "border-gray-300"
              } rounded-lg bg-[#f5f5f5]`}
              onChange={(e) => setZipCode(e.target.value)}
            />
            {!validate[0].isValid && isContinueClicked && validate[0].message && <ErrorMessage message={validate[0].message} />}
          </div>

          <div className="my-8">
            <div className="flex items-center justify-center mt-6 my-2">
              <Button
                color="primary"
                text={t("trips.myTrips.localExperiences.tourDetails.submitPayment")}
                disabled={isButtonDisabled}
                onClick={(e) => {
                  onSubmit(e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViatorBookingPaymentDetails;
