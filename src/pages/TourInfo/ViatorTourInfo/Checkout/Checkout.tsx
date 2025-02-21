import React, { useEffect, useRef, useState } from "react";
import ViatorBookingContactDetails from "./ViatorBookingContactDetails/ViatorBookingContactDetails";
import ViatorBookingPaymentDetails from "./ViatorBookingPaymentDetails/ViatorBookingPaymentDetails";
import Model, { Providers } from "@tripian/model";
import ViatorBookingActivityDetails from "./ViatorBookingActivityDetails/ViatorBookingActivityDetails";
import TravelSummary from "./TravelSummary/TravelSummary";
import { Modal, Button } from "@tripian/react";

interface ICheckout {
  user?: Model.User;
  tourName: string;
  tourImage: string;
  travelDate?: string;
  travelHour?: string;
  travelPrice?: number;
  bookerInfo: Providers.Viator.BookerInfo;
  communication: Providers.Viator.Communication;
  bookingQuestions?: Providers.Viator.BookingQuestion[];
  bookingQuestionAnswers?: Providers.Viator.BookingQuestionAnswer[];
  languageGuides?: Providers.Viator.LanguageGuide[];
  logistics?: Providers.Viator.Logistics;
  paymentSessionToken?: string;
  travelerCount: number;
  locations: Providers.Viator.GroupedLocations;
  cancellationInfo?: string;
  flags?: string[];
  pickupIncluded: boolean;
  modalVisible: boolean;
  handleFetchBookingHold: () => void;
  clickedBookingContactDetails: ({ bookerInfo, communication }: { bookerInfo: Providers.Viator.BookerInfo; communication: Providers.Viator.Communication }) => void;
  clickedBookingActivityDetails: ({
    bookingQuestionAnswers,
    languageGuide,
  }: {
    bookingQuestionAnswers: Providers.Viator.BookingQuestionAnswer[];
    languageGuide?: Providers.Viator.LanguageGuide;
  }) => void;
  setPaymentLoading: (loading: boolean) => void;
  onPaymentSuccess: (paymentToken: string) => void;
  onPaymentError: (error: string) => void;
  t: (value: Model.TranslationKey) => string;
}

const Checkout: React.FC<ICheckout> = ({
  user,
  tourName,
  tourImage,
  travelDate,
  travelHour,
  travelPrice,
  bookerInfo,
  communication,
  bookingQuestions,
  bookingQuestionAnswers,
  languageGuides,
  logistics,
  paymentSessionToken,
  travelerCount,
  locations,
  cancellationInfo,
  flags,
  pickupIncluded,
  modalVisible,
  handleFetchBookingHold,
  clickedBookingContactDetails,
  clickedBookingActivityDetails,
  setPaymentLoading,
  onPaymentSuccess,
  onPaymentError,
  t,
}) => {
  const [activeContainer, setActiveContainer] = useState(1); // Track which container is open
  const [isContactFormComplete, setIsContactFormComplete] = useState(false);

  // Refs for each section
  const contactRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  // Scroll to the active container when it changes
  useEffect(() => {
    if (activeContainer === 1 && contactRef.current) {
      const elementPosition = contactRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offset = -100;
      window.scrollTo({ top: elementPosition + offset, behavior: "smooth" });
    } else if (activeContainer === 2 && activityRef.current) {
      const elementPosition = activityRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offset = -100;
      window.scrollTo({ top: elementPosition + offset, behavior: "smooth" });
    }
  }, [activeContainer]);

  // Handler to go to the next container
  const handleNext = () => {
    if (activeContainer === 1) {
      setIsContactFormComplete(true);
      setActiveContainer(2);
    } else if (activeContainer === 2) {
      setActiveContainer(3);
    }
  };

  // Handler to open a specific container on Edit click
  const handleEdit = (containerNumber: number) => {
    setActiveContainer(containerNumber);
  };
  return (
    <div className="row">
      <div className="col col6-m col12 m0">
        <div className="flex flex-col gap-8 p-6">
          {/* Container 1: Contact Details */}
          <div className="pl-4" ref={contactRef}>
            <ViatorBookingContactDetails
              active={activeContainer === 1}
              clicked={({ bookerInfo, communication }: { bookerInfo: Providers.Viator.BookerInfo; communication: Providers.Viator.Communication }) => {
                clickedBookingContactDetails({ bookerInfo, communication });
                handleNext();
              }}
              user={user}
              bookerInfo={bookerInfo}
              communication={communication}
              handleEditContactDetails={() => {
                handleEdit(1);
                setIsContactFormComplete(false);
              }}
              t={t}
            />
          </div>

          {/* Container 2: Activity Details */}
          <div className="pl-4" ref={activityRef}>
            <ViatorBookingActivityDetails
              active={activeContainer === 2}
              clicked={({
                bookingQuestionAnswers,
                languageGuide,
              }: {
                bookingQuestionAnswers: Providers.Viator.BookingQuestionAnswer[];
                languageGuide?: Providers.Viator.LanguageGuide;
              }) => {
                clickedBookingActivityDetails({ bookingQuestionAnswers, languageGuide });
                handleNext();
              }}
              handleEditActivityDetails={() => handleEdit(2)}
              bookingQuestions={bookingQuestions}
              questionAnswers={bookingQuestionAnswers}
              languageGuides={languageGuides}
              logistics={logistics}
              travelerCount={travelerCount}
              tourName={tourName}
              tourImage={tourImage}
              travelDate={travelDate}
              travelHour={travelHour}
              travelPrice={travelPrice}
              isEditable={isContactFormComplete}
              locations={locations}
              cancellationInfo={cancellationInfo}
              flags={flags}
              pickupIncluded={pickupIncluded}
              t={t}
            />
          </div>

          {/* Container 3: Payment */}
          <div className="pl-4">
            {activeContainer === 3 ? (
              <ViatorBookingPaymentDetails
                paymentRef={paymentRef}
                paymentSessionToken={paymentSessionToken}
                setPaymentLoading={setPaymentLoading}
                onSuccess={onPaymentSuccess}
                onError={onPaymentError}
                t={t}
              />
            ) : (
              <div className="row px-5 relative m-0 rounded-lg border-[1px] border-solid border-gray-300 min-h-20">
                <div className="col col12 my4 flex items-center gap-2">
                  <div className="rounded-full border-[1px] w-5 h-5 flex items-center justify-center border-black text-sm">3</div>
                  <h3 className="font-bold text-lg">{t("trips.myTrips.localExperiences.tourDetails.paymentDetails")}</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col col6-m col12 m0 bg-[#f5f5f5] hide-s">
        <div className="sticky top-28">
          <TravelSummary
            tourName={tourName}
            tourImage={tourImage}
            travelerCount={travelerCount}
            travelDate={travelDate}
            travelHour={travelHour}
            travelPrice={travelPrice}
            cancellationInfo={cancellationInfo}
            flags={flags}
            t={t}
          />
        </div>
      </div>
      {modalVisible && (
        <Modal show={modalVisible} className="booking-modal p5">
          <div className="row m0 flex flex-col">
            <div className="mb-4 font-bold text-xl mr-1">{t("trips.myTrips.localExperiences.tourDetails.yourSessionExpired.title")}</div>
            <div className="block mb-4">{t("trips.myTrips.localExperiences.tourDetails.yourSessionExpired.desc")}</div>
            <div>
              <Button color="primary" text="Continue Checkout" onClick={handleFetchBookingHold} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Checkout;
