import React, { useState } from "react";
import { Button, PreLoading, SvgIcons } from "@tripian/react";
import moment from "moment";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";

interface IViatorBookingDetails {
  items?: Providers.Viator.BookingConfirmItem[];
  totalConfirmedPrice?: Providers.Viator.BookingConfirmTotalPrice;
  voucherInfo?: Providers.Viator.VoucherInfo;
  tourName: string;
  tourImage: string;
  travelDate?: string;
  travelHour?: string;
  loading?: boolean;
  buttonText?: string;
  showButton?: boolean;
  clicked: () => void;
  t: (value: Model.TranslationKey) => string;
}

const ViatorBookingDetails: React.FC<IViatorBookingDetails> = ({
  items,
  totalConfirmedPrice,
  voucherInfo,
  tourName,
  tourImage,
  travelDate,
  travelHour,
  loading,
  buttonText,
  showButton = true,
  clicked,
  t,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loadingRefund, setLoadingRefund] = useState<boolean>(false);
  const [refundDetail, setRefundDetail] = useState<Providers.Viator.BookingRefund>();

  const travelerDetails = items?.[0]?.lineItems
    ? items[0].lineItems
        .map((item) => {
          return `${item.numberOfTravelers} ${item.ageBand}`;
        })
        .join(", ")
    : "N/A"; // Provide a fallback value if data is not available

  const totalPrice = totalConfirmedPrice?.price?.partnerNetPrice ?? 0;

  const travelerPricingDetails = items?.[0]?.lineItems
    ? items[0].lineItems
        .map((item) => {
          const subtotal = item.subtotalPrice?.price?.partnerNetPrice ?? 0;
          return `${item.numberOfTravelers} ${item.ageBand} $${subtotal}`;
        })
        .join(", ")
    : "N/A"; // Provide a fallback value if data is not available

  const bookingStatus = items?.[0]?.status;

  return (
    <div className="p-4 w-full">
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          {loadingRefund ? (
            <div>
              <PreLoading size="small" color="#fff" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4 text-center">{refundDetail?.status}</h2>
              <div className="product-info mt-4 flex flex-col text-sm">
                <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm font-medium mb-2">
                  <li className="flex items-start">
                    {t("trips.myTrips.localExperiences.tourDetails.cancellation.refundAmount")}:
                    <span className="ml-2">
                      {refundDetail?.refundDetails.refundAmount} {refundDetail?.refundDetails.currencyCode}
                    </span>
                  </li>
                  <li className="flex items-start">
                    {t("trips.myTrips.localExperiences.tourDetails.cancellation.refundPercentage")}:<span className="ml-2">%{refundDetail?.refundDetails.refundPercentage}</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Button text="Cancel" onClick={() => setModalOpen(false)} />
                <Button
                  color="primary"
                  text="Continue"
                  onClick={() => {
                    setModalOpen(false);
                    clicked();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <div>
        <div className="row center mb0">
          <div
            className={`w-20 h-20 flex items-center justify-center rounded-full ${
              bookingStatus === "REJECTED" ? "bg-red-600" : bookingStatus === "PENDING" ? "bg-yellow-500" : "bg-green-600"
            }`}
          >
            {bookingStatus === "REJECTED" ? (
              <SvgIcons.Exclamation2 fill="#fff" size="4rem" />
            ) : bookingStatus === "PENDING" ? (
              <SvgIcons.Time fill="#fff" size="4rem" />
            ) : (
              <SvgIcons.Success fill="#fff" size="4rem" />
            )}
          </div>
        </div>
        <div className="row center mb0 mt4">
          <div className="col col12 mb0">
            <h4 className="text-lg font-bold line-clamp-3">
              {bookingStatus === "REJECTED"
                ? t("trips.myTrips.localExperiences.tourDetails.bookingStatus.rejected.title")
                : bookingStatus === "PENDING"
                ? t("trips.myTrips.localExperiences.tourDetails.bookingStatus.pending.title")
                : t("trips.myTrips.localExperiences.tourDetails.bookingStatus.confirmed.title")}
            </h4>
          </div>
          {/* {bookingStatus === "CONFIRMED" && !voucherInfo?.isVoucherRestrictionRequired && (
            <div className="w-full mt-4 mb-4 font-medium underline text-base line-clamp-2">
              <a className="" rel="noopener noreferrer" target="_blank" href={voucherInfo?.url}>
                {t("trips.myTrips.localExperiences.tourDetails.goToTicketDetails")}
              </a>
            </div>
          )} */}
        </div>
        <div className="center mb0">
          <div className="relative m-0 p-0">
            <div className="rounded-lg bg-white">
              <div className="p-5 text-black">
                {bookingStatus === "REJECTED" ? (
                  <div className="text-base font-medium">{t("trips.myTrips.localExperiences.tourDetails.bookingStatus.rejected.description")}</div>
                ) : bookingStatus === "PENDING" ? (
                  <div className="text-base font-medium">{t("trips.myTrips.localExperiences.tourDetails.bookingStatus.pending.description")}</div>
                ) : (
                  <div>
                    <div className="photo-row flex gap-4 items-start">
                      <img className="w-20 h-20 rounded-md object-cover overflow-hidden shrink-0" src={tourImage} alt="" />
                      <div>
                        <div className="Likely to Sell Out mb-1 flex items-start">
                          <div className="bg-green-600 text-white inline-flex items-center py-3 px-2 rounded-sm h-6 max-w-full">
                            <strong className="overflow-ellipsis self-auto whitespace-nowrap leading-5 text-sm font-bold">
                              {t("trips.myTrips.localExperiences.tourDetails.freeCancellation")}
                            </strong>
                          </div>
                        </div>
                        <span className="text-sm font-bold line-clamp-3 text-start">{tourName}</span>
                      </div>
                    </div>
                    <div className="product-info mt-4 flex flex-col text-sm">
                      <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm font-medium mb-2">
                        <li className="flex items-start">
                          <SvgIcons.Avatar className="mt-[0.125rem] mr-2" size="0.875rem" fill="#000" />
                          <span>{travelerDetails}</span>
                        </li>
                        <li className="flex items-start">
                          <SvgIcons.Calendar className="mt-[0.175rem] mr-2" size="0.875rem" fill="#000" />
                          <span>{moment(travelDate).format("ddd, MMM DD, YYYY")}</span>
                          {travelHour && (
                            <>
                              <span className="whitespace-pre-wrap px-1"> • </span>
                              <span>{moment(travelHour, "HH:mm").format("hh:mm A")}</span>
                            </>
                          )}
                        </li>
                      </ul>
                    </div>

                    <div className="pricing-row flex items-end gap-2 flex-row-reverse text-end">
                      <div className="font-bold">{travelerPricingDetails}</div>
                    </div>
                    <hr className="my-4" style={{ opacity: 0.6 }} />
                    <div className="flex justify-between font-bold w-full text-lg">
                      <div>{t("trips.myTrips.localExperiences.tourDetails.totalPrice")}</div>
                      <div>${totalPrice}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showButton && (
          <div className="row center">
            <div>
              {loading ? (
                <div>
                  <PreLoading size="small" bgColor="#fff" />
                </div>
              ) : (
                <Button
                  color="primary"
                  text={buttonText}
                  onClick={() => {
                    if (buttonText === t("trips.myTrips.localExperiences.tourDetails.cancelReservation")) {
                      setLoadingRefund(true);
                      providers.viator
                        ?.bookingRefundDetails(items?.[0].bookingRef || "")
                        .then((data) => {
                          setRefundDetail(data);
                        })
                        .finally(() => setLoadingRefund(false));
                      setModalOpen(true);
                    } else {
                      clicked();
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViatorBookingDetails;
