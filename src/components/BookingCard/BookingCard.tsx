/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import Model from "@tripian/model";
import { SvgIcons } from "@tripian/react";
import React from "react";

interface IBookingCard {
  image: string;
  title: string;
  dateTime?: string;
  person?: string;
  status?: string;
  provider: string;
  pastBooking?: boolean;
  clicked: () => void;
  t: (value: Model.TranslationKey) => string;
}

enum STATUS {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  CONFIRMED = "CONFIRMED",
}

const BookingCard: React.FC<IBookingCard> = ({ image, title, dateTime, person, status, provider, pastBooking = false, clicked, t }) => {
  const translateStatus = (status: string) => {
    switch (status) {
      case STATUS.PENDING:
        return t("trips.myTrips.localExperiences.tourDetails.bookingStatus.pending.title");
      case STATUS.REJECTED:
        return t("trips.myTrips.localExperiences.tourDetails.bookingStatus.rejected.title");
      case STATUS.CONFIRMED:
        return t("trips.myTrips.localExperiences.tourDetails.bookingStatus.confirmed.title");
      default:
        return "";
    }
  };
  return (
    <main
      className="w-full flex flex-col md:flex-row rounded-lg overflow-hidden max-w-lg md:max-w-3xl md:min-w-[50rem] mx-auto my-1 cursor-pointer"
      role="button"
      onKeyDown={() => {}}
      tabIndex={0}
      onClick={() => clicked()}
    >
      <section className="w-full flex-grow flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row w-full max-w-3xl text-zinc-900 h-auto md:h-48">
          <div className="relative h-auto md:h-full bg-white flex items-center justify-center py-8 md:px-8 rounded-t-3xl md:rounded-l-3xl">
            <div className="w-32 h-auto flex items-center justify-center bg-white">
              <img src={image} alt="tour" className={`h-full w-full object-cover rounded-2xl ${pastBooking ? "grayscale" : ""}`} />
            </div>

            <span
              className={`absolute top-0 left-0 right-0 text-center md:top-[unset] md:bottom-3 text-primary-color text-base font-bold px-2 py-1 rounded-lg z-10 ${
                pastBooking ? "grayscale" : ""
              }`}
            >
              {provider.toUpperCase()}
            </span>
          </div>
          <div className="relative w-full md:w-auto h-auto flex flex-col items-center justify-between border-dashed border-2 bg-white border-gray-200">
            <div className="absolute rounded-full w-8 h-8 bg-gray-100 md:-top-5 md:block hidden" />
            <div className="absolute rounded-full w-8 h-8 bg-gray-100 md:-bottom-5 md:block hidden" />
            <div className="absolute rounded-full w-8 h-8 bg-gray-100 md:hidden -top-4 -left-5" />
            <div className="absolute rounded-full w-8 h-8 bg-gray-100 md:hidden -top-4 -right-5" />
          </div>
          <div className="h-auto md:h-full py-8 px-10 bg-white flex-grow rounded-b-3xl md:rounded-r-3xl flex flex-col">
            <div className="relative h-full">
              <h2 className="text-sm md:text-base mb-4 line-clamp-2">{title}</h2>
              <div className="flex items-center mb-2">
                <SvgIcons.Calendar className="mr-2" size="0.875rem" />
                <span>{dateTime}</span>
              </div>
              {person && (
                <div className="flex items-center">
                  <SvgIcons.Avatar className="mr-2" size="0.875rem" />
                  <span>{person}</span>
                </div>
              )}
              {status && (
                <span className={`absolute -bottom-4 -right-6 bg-primary-color text-white text-xs font-bold py-1 px-3 rounded-full ${pastBooking ? "grayscale" : ""}`}>
                  {translateStatus(status)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookingCard;
