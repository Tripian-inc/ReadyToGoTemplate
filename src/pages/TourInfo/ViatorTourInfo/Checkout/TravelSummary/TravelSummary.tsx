import Model from "@tripian/model";
import { SvgIcons } from "@tripian/react";
import moment from "moment";
import React from "react";

enum FLAG {
  FREE_CANCELLATION = "Free Cancellation",
  LIKELY_TO_SELL_OUT = "Likely To Sell Out",
  NEW_ON_VIATOR = "New On Viator",
  VIATOR_EXCLUSIVE = "Viator Exclusive",
  SKIP_THE_LINE = "Skip The Line",
  PRIVATE_TOUR = "Private Tour",
  SPECIAL_OFFER = "Special Offer",
}

interface ITravelSummary {
  tourName: string;
  tourImage: string;
  travelDate?: string;
  travelHour?: string;
  travelPrice?: number;
  travelerCount: number;
  cancellationInfo?: string;
  flags?: string[];
  showPrice?: boolean;
  t: (value: Model.TranslationKey) => string;
}

const TravelSummary: React.FC<ITravelSummary> = ({ tourName, tourImage, travelDate, travelHour, travelPrice, travelerCount, cancellationInfo, flags, showPrice = true, t }) => {
  const flagArr = flags
    ? flags.map((pr) =>
        pr
          .toLowerCase()
          .split("_")
          .map((p) => p && p[0].toUpperCase() + p.slice(1))
          .join(" ")
      )
    : [];

  const translateFlag = (flag: string) => {
    switch (flag) {
      case FLAG.FREE_CANCELLATION:
        return t("trips.myTrips.localExperiences.tourDetails.freeCancellation");
      case FLAG.LIKELY_TO_SELL_OUT:
        return t("trips.myTrips.localExperiences.tourDetails.likelyToSellOut");
      case FLAG.NEW_ON_VIATOR:
        return t("trips.myTrips.localExperiences.tourDetails.newOnViator");
      case FLAG.VIATOR_EXCLUSIVE:
        return t("trips.myTrips.localExperiences.tourDetails.viatorExclusive");
      case FLAG.SKIP_THE_LINE:
        return t("trips.myTrips.localExperiences.tourDetails.skipTheLine");
      case FLAG.PRIVATE_TOUR:
        return t("trips.myTrips.localExperiences.tourDetails.privateTour");
      case FLAG.SPECIAL_OFFER:
        return t("trips.myTrips.localExperiences.tourDetails.specialOffer");
      default:
        return "";
    }
  };
  return (
    <div className="relative m-0 p-0">
      <div className={`rounded-lg bg-white ${showPrice ? "shadow-sm m-6" : ""}`}>
        <div className="p-5 text-black">
          <div>
            <div className="photo-row flex gap-4 items-start">
              <img className="w-20 h-20 rounded-md object-cover overflow-hidden shrink-0" src={tourImage} alt="" />
              <div>
                <div className="mb-1">
                  {flagArr.map((flag, i) => (
                    <div
                      key={i}
                      style={{ backgroundColor: flag === FLAG.FREE_CANCELLATION ? "green" : flag === FLAG.LIKELY_TO_SELL_OUT ? "red" : "gray" }}
                      className="text-white inline-flex items-center py-3 px-2 rounded-sm h-6 max-w-full mr-2 mb-2"
                    >
                      <strong className="overflow-ellipsis self-auto whitespace-nowrap leading-5 text-sm font-bold ">
                        <span>{translateFlag(flag)}</span>
                        &nbsp;
                      </strong>
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold line-clamp-2">{tourName}</span>
              </div>
            </div>
            <div className="product-info mt-4 flex flex-col text-sm">
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm font-medium mb-2">
                <li className="flex items-start">
                  <SvgIcons.Avatar className="mt-[0.125rem] mr-2" size="0.875rem" fill="#000" />
                  <span>
                    {travelerCount} {t("trips.myTrips.localExperiences.tourDetails.person")}
                  </span>
                </li>
                <li className="flex items-start">
                  <SvgIcons.Calendar className="mt-[0.175rem] mr-2" size="0.875rem" fill="#000" />
                  <span>{moment(travelDate).format("ddd,MMM DD,YYYY")}</span>
                  {travelHour && (
                    <>
                      <span className="whitespace-pre-wrap px-1"> • </span>
                      <span>{moment(travelHour, "HH:mm").format("hh:mm A")}</span>
                    </>
                  )}
                </li>
                {cancellationInfo && (
                  <li className="flex items-start">
                    <SvgIcons.Check className="mt-[0.175rem] mr-2" size="0.85rem" fill="#000" />
                    <span>{cancellationInfo}</span>
                  </li>
                )}
              </ul>
            </div>
            {showPrice && (
              <div className="pricing-row flex items-end gap-2 flex-row-reverse text-end">
                <div className="font-bold">${travelPrice}</div>
              </div>
            )}
          </div>
          {showPrice && (
            <>
              <hr className="my-4" style={{ opacity: 0.6 }} />
              <div className="flex justify-between font-bold w-full text-lg">
                <div>{t("trips.myTrips.localExperiences.tourDetails.totalPrice")}</div>
                <div>${travelPrice}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelSummary;
