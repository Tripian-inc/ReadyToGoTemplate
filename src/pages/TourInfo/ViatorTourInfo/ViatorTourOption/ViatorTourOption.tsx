import React, { useCallback, useEffect, useMemo, useState } from "react";
import Model, { Providers } from "@tripian/model";
import moment from "moment";
import { Button, ReadMoreLess, SvgIcons } from "@tripian/react";
import classes from "./ViatorTourOption.module.scss";

interface IViatorTourOption {
  tourOption: {
    productOptionCode: string;
    timedEntries: {
      startTime?: string;
      available: boolean;
      unavailableReason?: string;
    }[];
    available: boolean;
    totalPrice: Providers.Viator.TotalPrice;
    lineItems: Providers.Viator.LineItem[];
  };
  productOption?: Providers.Viator.ProductOption;
  exchangeRates: Providers.Viator.ExchangeRates[];
  travelDate?: string;
  selectedHour: string;
  setSelectedHour: (hour: string) => void;
  currency?: string;
  bookingRequestCallback: (productOptionCode: string) => void;
  setSelectedOption: (productOptionCode: string) => void;
  isSelected: boolean;
  t: (value: Model.TranslationKey) => string;
}

const ViatorTourOption: React.FC<IViatorTourOption> = ({
  tourOption,
  productOption,
  exchangeRates,
  travelDate,
  selectedHour,
  setSelectedHour,
  currency,
  bookingRequestCallback,
  setSelectedOption,
  isSelected,
  t,
}) => {
  moment.locale(window.twindow.langCode);

  const [showAllTimes, setShowAllTimes] = useState(false);

  const timeSlots = useMemo(() => {
    return [...tourOption.timedEntries].sort((a, b) => {
      if (a.startTime && b.startTime) {
        return moment(a.startTime, "HH:mm").diff(moment(b.startTime, "HH:mm"));
      }
      return 0;
    });
  }, [tourOption.timedEntries]);

  const travelPrice = useCallback(
    (price: number) => {
      return exchangeRates.length > 0 ? Number((exchangeRates[0].rate * price).toFixed(1)) : price;
    },
    [exchangeRates]
  );

  const addToCart = () => {
    if (tourOption) bookingRequestCallback(tourOption.productOptionCode);
  };

  useEffect(() => {
    const availableHours = timeSlots.filter((e) => e.available === true);
    if (availableHours.length > 0 && availableHours[0].startTime) {
      setSelectedHour(availableHours[0].startTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTimeSlots = () => {
    const visibleSlots = showAllTimes ? timeSlots : timeSlots.slice(0, 7);

    return (
      <>
        {visibleSlots.map((time_slot, index) => {
          if (time_slot.available) {
            return (
              <div
                key={index}
                className={`${classes.timeOption} ${selectedHour === time_slot.startTime ? classes.selectedTimeOption : ""}`}
                onClick={() => setSelectedHour(time_slot.startTime || "")}
              >
                {time_slot?.startTime && moment(time_slot.startTime, "HH:mm").format("LT")}
              </div>
            );
          } else {
            return (
              <div key={index} className={`${classes.timeUnAvailableOption} cursor-not-allowed`}>
                {time_slot?.startTime && moment(time_slot.startTime, "HH:mm").format("LT")}
              </div>
            );
          }
        })}
        {timeSlots.length > 5 && (
          <div className="flex w-full items-center justify-center mr-12 my-2 font-bold text-blue-950">
            <button onClick={() => setShowAllTimes((prev) => !prev)} className={classes.seeMoreButton}>
              {showAllTimes ? t("trips.myTrips.localExperiences.tourDetails.seeLessTimes") : t("trips.myTrips.localExperiences.tourDetails.seeMoreTimes")}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`${classes.mainDiv} border-2 border-solid ${isSelected ? "border-blue-500" : "border-slate-200"}`}>
      {tourOption?.available === true ? (
        <div className="w-full" onClick={() => setSelectedOption(tourOption.productOptionCode)}>
          <div className="p-4">
            <div className="flex gap-4 items-start">
              <div className="mt-[0.125rem]">{isSelected ? <SvgIcons.RadioButtonChecked /> : <SvgIcons.RadioButtonUnChecked />}</div>
              <div>
                <div className="font-bold text-lg mb-2">{productOption?.title}</div>
                {isSelected && (
                  <>
                    {productOption &&
                      (/<[a-z][\s\S]*>/i.test(productOption.description) ? (
                        <div
                          className="mb-2"
                          dangerouslySetInnerHTML={{
                            __html: productOption.description,
                          }}
                        />
                      ) : (
                        <div>
                          <ReadMoreLess desc={productOption.description} defaultCharLenght={120} t={t} />
                        </div>
                      ))}
                    <div className={classes.startTime}>{moment(travelDate).format("dddd, ll")}</div>
                    {tourOption.timedEntries[0].startTime && <div className={classes.timeOptions}>{renderTimeSlots()}</div>}
                  </>
                )}
              </div>
            </div>
            <div className="hide-s text-right pr-2">
              <div>
                {tourOption?.lineItems.map((i, index) => (
                  <div key={index}>
                    <span style={{ textTransform: "capitalize" }}>{i.ageBand}</span> <span>{i.numberOfTravelers}</span> ×{" "}
                    <span>{travelPrice(i.subtotalPrice.price.partnerNetPrice)}</span> <span>{currency}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className={classes.gygTourOptionsBottomPrice}>{travelPrice(tourOption?.totalPrice.price.partnerTotalPrice)}</span>&nbsp;
                <span className={classes.gygTourOptionsBottomPrice}>{currency}</span>
              </div>
              {isSelected && <Button className={classes.addToCartButton} onClick={addToCart} text={t("trips.myTrips.localExperiences.tourDetails.bookNow")} />}
            </div>
            <div className="hide-m">
              <hr className="w-full h-px my-4 bg-gray-200 border-0" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={classes.gygTourOptionsBottomPrice}>{travelPrice(tourOption?.totalPrice.price.partnerTotalPrice)}</span>&nbsp;
                  <span className={classes.gygTourOptionsBottomPrice}>{currency}</span>
                </div>
                <div>
                  {tourOption?.lineItems.map((i, index) => (
                    <div key={index}>
                      <span style={{ textTransform: "capitalize" }}>{i.ageBand}</span> <span>{i.numberOfTravelers}</span> × <span>{i.subtotalPrice.price.partnerNetPrice}</span>{" "}
                      <span>{currency}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isSelected && <Button className={classes.addToCartButton} onClick={addToCart} text={t("trips.myTrips.localExperiences.tourDetails.bookNow")} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="p-4 cursor-not-allowed bg-gray-200 border-2 border-solid rounded-[0.875rem]">
            <div className="flex gap-4 items-start">
              <div className="mt-[0.125rem]">
                <SvgIcons.RadioButtonUnChecked />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-500">{productOption?.title}</div>
                {/* <div>{tourOption?.unavailableReason}</div>
                <div className={classes.timeOptions}>{tourOption?.startTime}</div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViatorTourOption;
