import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";
import useReservation from "./useReservation";
import moment from "moment";
import useTranslate from "./useTranslate";

export const defaultBookingConfirmRequest: Providers.Viator.BookingConfirmRequest = {
  cartRef: "",
  bookerInfo: {
    firstName: "",
    lastName: "",
  },
  communication: {
    email: "",
    phone: "",
  },
  items: [],
  paymentToken: "",
};

const useViatorApi = (cityId?: number, cityName?: string, arrivalDatetime?: string, departureDatetime?: string) => {
  const [viatorBookingInfo, setViatorBookingInfo] = useState<Providers.Viator.BookingConfirm>();
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [availableDate, setAvailableDate] = useState<string>(moment().add(1, "days").format("YYYY-MM-DD"));
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [locations, setLocations] = useState<Providers.Viator.GroupedLocations>({
    start: [],
    end: [],
    pickup: [],
  });
  const [loadings, setLoadings] = useState<
    "loadingViatorProductInfo" | "loadingViatorProductAvailability" | "loadingBookingHold" | "loadingBookingConfirm" | "loadingViatorLocations" | ""
  >("");

  const [viatorProductInfo, setViatorProductInfo] = useState<Providers.Viator.TourData>();

  const [viatorProductAvailability, setViatorProductAvailability] = useState<Providers.Viator.AvailabilityCheck>();

  const [successfullBooking, setSuccessfullBooking] = useState<boolean>(false);

  const [paymentSessionToken, setPaymentSessionToken] = useState<string>();

  const [bookingConfirmRequest, setBookingConfirmRequest] = useState<Providers.Viator.BookingConfirmRequest>(defaultBookingConfirmRequest);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [paymentFailed, setPaymentFailed] = useState<boolean>(false);

  const [exchangeRates, setExchangeRates] = useState<Providers.Viator.ExchangeRates[]>([]);

  const { reservationAdd } = useReservation(cityId);

  const dispatch = useDispatch();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const exchangeRatesTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useTranslate();

  const fetchLocations = useCallback(
    async (pickupLocRefs?: string[], startLocRefs?: string[], endLocRefs?: string[]): Promise<void> => {
      if (providers.viator && window.tconfig.SHOW_TOURS_AND_TICKETS && window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
        setLoadings("loadingViatorLocations");
        const groupedPickupLocations: Providers.Viator.Location[] = [];
        const groupedStartLocations: Providers.Viator.Location[] = [];
        const groupedEndLocations: Providers.Viator.Location[] = [];

        const allLocRefs = [...(pickupLocRefs || []), ...(startLocRefs || []), ...(endLocRefs || [])];

        // Helper function for batching requests
        const fetchBatchedLocations = async (locRefs: string[]): Promise<Providers.Viator.Location[]> => {
          const batchedResults: Providers.Viator.Location[] = [];
          const batchSize = 300;

          for (let i = 0; i < locRefs.length; i += batchSize) {
            const slicedRefs = locRefs.slice(i, i + batchSize);
            try {
              const response = await providers.viator?.locations(slicedRefs);
              if (response) batchedResults.push(...response.locations);
            } catch (error: any) {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchLocationsError", error));
            }
          }

          return batchedResults;
        };

        try {
          // Fetch all locations
          if (allLocRefs.length > 0) {
            const allResults = await fetchBatchedLocations(allLocRefs);

            // Separate results based on the provided references
            allResults.forEach((location) => {
              if (pickupLocRefs?.includes(location.reference)) {
                groupedPickupLocations.push(location);
              }
              if (startLocRefs?.includes(location.reference)) {
                groupedStartLocations.push(location);
              }
              if (endLocRefs?.includes(location.reference)) {
                groupedEndLocations.push(location);
              }
            });
          }

          setLocations({
            start: groupedStartLocations,
            end: groupedEndLocations,
            pickup: groupedPickupLocations,
          });
        } catch (error: any) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchLocationsError", error));
        } finally {
          setLoadings("");
        }
      }
    },
    [dispatch]
  );

  const fetchProductInfo = useCallback(
    (productCode: string): Promise<Boolean> => {
      if (providers.viator && window.tconfig.SHOW_TOURS_AND_TICKETS && window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
        setLoadings("loadingViatorProductInfo");
        setViatorProductInfo(undefined);

        return providers.viator
          .tourData(productCode)
          .then((data: Providers.Viator.TourData) => {
            const pickupLocRefs = data.info.logistics.travelerPickup.locations?.map((l) => l.location.ref);
            const startLocRefs = data.info.logistics.start?.map((l) => l.location.ref);
            const endLocRefs = data.info.logistics.end?.map((l) => l.location.ref);
            fetchLocations(pickupLocRefs, startLocRefs, endLocRefs);

            if (window.tconfig.PROVIDERS.tourAndTicket.find((t) => t.id === Model.PROVIDER_ID.VIATOR)?.prod === false) {
              setViatorProductInfo(data);
            } else {
              setViatorProductInfo(data);
            }
            return true;
          })
          .catch((viatorFetchProductInfoError) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchTourError", viatorFetchProductInfoError));
            setLoadings("");
            return false;
          })
          .finally(() => {
            setLoadings("");
          });
      }
      return Promise.resolve(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const fetchProductAvailability = useCallback(
    async (request: Providers.Viator.AvailabilityCheckRequest): Promise<Boolean> => {
      setLoadings("loadingViatorProductAvailability");
      try {
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
          if (providers.viator && /* tripReference && */ window.tconfig.SHOW_TOURS_AND_TICKETS) {
            const res = await providers.viator.availabilityPriceCheck(request);

            if ((res as any).code) {
              const errorMessage = (res as any).message;
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchAvailabilityError", errorMessage as string));
              return false;
            } else {
              setViatorProductAvailability(res as Providers.Viator.AvailabilityCheck);
              return true;
            }
          }
          return Promise.resolve(false);
        }
      } catch (viatorFetchProductAvailabilityError) {
        setViatorProductAvailability(undefined);
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchAvailabilityError", viatorFetchProductAvailabilityError as string));
        return false;
      } finally {
        setLoadings("");
      }

      setLoadings("");
      return Promise.resolve(false);
    },
    [dispatch]
  );

  const fetchExchangeRates = useCallback(async (sourceCurrencies: string[], targetCurrencies: string[]) => {
    try {
      const response = await providers.viator?.exchangeRates(sourceCurrencies, targetCurrencies);

      if (response && response.length > 0) {
        setExchangeRates(response);

        const expiryTime = response[0]?.expiry;
        if (expiryTime) {
          const expiryMoment = moment(expiryTime);
          const now = moment();

          if (expiryMoment.isAfter(now)) {
            const delay = expiryMoment.diff(now);

            if (exchangeRatesTimerRef.current) {
              clearTimeout(exchangeRatesTimerRef.current);
            }

            exchangeRatesTimerRef.current = setTimeout(() => {
              fetchExchangeRates(sourceCurrencies, targetCurrencies);
            }, delay);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }, []);

  useEffect(() => {
    if (viatorProductAvailability && viatorProductAvailability?.currency !== "USD") {
      fetchExchangeRates([viatorProductAvailability.currency], ["USD"]);
    }

    return () => {
      if (exchangeRatesTimerRef.current) {
        clearTimeout(exchangeRatesTimerRef.current);
      }
    };
  }, [fetchExchangeRates, viatorProductAvailability]);

  const resetTimer = useCallback((validUntilTime?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (validUntilTime) {
      const validUntil = moment.utc(validUntilTime);
      const now = moment.utc();

      const delay = validUntil.diff(now);

      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          setModalVisible(true);
        }, delay);
      } else {
        setModalVisible(true);
      }
    }
  }, []);

  const fetchProductBookingHold = useCallback(
    (request: Providers.Viator.BookingCardHoldRequest): Promise<Boolean> => {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR) && window.tconfig.SHOW_TOURS_AND_TICKETS && providers.viator) {
        setLoadings("loadingBookingHold");
        return providers.viator
          ?.bookingCardHold(request)
          .then((data) => {
            setPaymentSessionToken(data.paymentSessionToken);
            setBookingConfirmRequest((prevRequest) => ({
              ...prevRequest,
              cartRef: data.cartRef,
              items: data.items.map((item) => ({
                bookingRef: item.bookingRef,
              })),
            }));

            if (data.items[0].status === "BOOKABLE") {
              const { availability, pricing } = data.items[0].bookingHoldInfo;

              const validUntilTimes = [availability.validUntil, pricing.validUntil].filter(Boolean);

              if (validUntilTimes.length > 0) {
                const earliestValidUntil = validUntilTimes.reduce((earliest, current) => {
                  return moment(current).isBefore(moment(earliest)) ? current : earliest;
                });

                resetTimer(earliestValidUntil);
                setModalVisible(false);
              }
            }

            if (data.items[0].status === "REJECTED") {
              const reason = data.items[0].rejectionReasonCode || "";
              dispatch(
                saveNotification(
                  Model.NOTIFICATION_TYPE.ERROR,
                  "viatorProductBookingHold",
                  reason
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")
                )
              );
              return false;
            }
            return true;
          })
          .catch((err) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorProductBookingHold", err as string));
            return false;
          })
          .finally(() => {
            setLoadings("");
          });
      }

      return Promise.resolve(true);
    },
    [dispatch, resetTimer]
  );

  const setBookingConfirm = (request: Providers.Viator.BookingConfirmRequest) => {
    setBookingConfirmRequest(request);
  };

  const setBookingConfirmLoading = (loading: boolean) => {
    if (loading === true) {
      setLoadings("loadingBookingConfirm");
    } else {
      setLoadings("");
    }
  };

  const setBookingInfoModal = (show: boolean) => {
    setShowInfoModal(show);
  };

  const setPaymentFailedModal = (failed: boolean) => {
    setPaymentFailed(failed);
  };

  const changeAvailableDate = (date: string) => {
    setAvailableDate(date);
  };

  const changeSelectedHour = (hour: string) => {
    setSelectedHour(hour);
  };

  const confirmPayment = async (requestParam: Providers.Viator.BookingConfirmRequest): Promise<boolean> => {
    const additionalBookingDetails: Providers.Viator.AdditionalBookingDetails = {
      fraudPreventionDetails: {
        subChannelId: window.location.origin,
        voucherDeliveryType: "EMAIL_TO_CUSTOMER",
      },
    };
    const confirmRequest = { ...requestParam, additionalBookingDetails };
    providers.viator
      ?.bookingConfirm(confirmRequest)
      .then((reservationInfo) => {
        const saveData: Providers.Viator.BookingReservationDetails = {
          ...reservationInfo,
          cityName: cityName || "",
          tourImage: viatorProductInfo?.info.images[0].variants[viatorProductInfo.info.images[0].variants.length - 1].url || "",
          tourName: viatorProductInfo?.info.title || "",
          availableDate,
          selectedHour,
        };

        const bookingDateTime = `${availableDate} ${selectedHour}`;
        const formattedBookingDateTime = moment(bookingDateTime).format("YYYY-MM-DD HH:mm:ss");

        if (reservationInfo.items[0].status === "CONFIRMED") {
          reservationAdd({ key: Model.PROVIDER_NAME.VIATOR, provider: Model.PROVIDER_NAME.VIATOR, value: saveData, bookingDateTime: formattedBookingDateTime }, false).then(() => {
            setSuccessfullBooking(true);
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.SUCCESS, "viatorBookingConfirmSuccess", t("trips.myTrips.localExperiences.tourDetails.successfullyBooked")));
          });
        }
        if (reservationInfo.items[0].status === "PENDING") {
          reservationAdd({ key: Model.PROVIDER_NAME.VIATOR, provider: Model.PROVIDER_NAME.VIATOR, value: saveData, bookingDateTime: formattedBookingDateTime }, false).then(() => {
            dispatch(
              saveNotification(Model.NOTIFICATION_TYPE.WARNING, "viatorBookingConfirmWarning", t("trips.myTrips.localExperiences.tourDetails.bookingIsStillAwatingConfirm"))
            );
          });
        }
        if (reservationInfo.items[0].status === "REJECTED") {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorBookingConfirmError", t("trips.myTrips.localExperiences.tourDetails.bookingRejected")));
        }
        setShowInfoModal(true);
        setViatorBookingInfo(reservationInfo);
      })
      .catch(async (viatorBookingConfirmError) => {
        const bookingStatus = await providers.viator?.bookingStatus({ bookingRef: requestParam.items[0].bookingRef });
        if (bookingStatus?.status === "FAILED") {
          setPaymentFailed(true);
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorBookingConfirmError", viatorBookingConfirmError as string));
        }
      })
      .finally(() => {
        setLoadings("");
      });
    return Promise.resolve(true);
  };

  const getCancellationPolicy = (cancellation: Providers.Viator.CancellationPolicy, cancellationTime: Date): string => {
    const currentTime = new Date(cancellationTime).getTime();

    if (cancellation.type === "ALL_SALES_FINAL") {
      return t("trips.myTrips.localExperiences.tourDetails.cancellation.allSalesFinal");
    }

    if (cancellation.type === "STANDARD" || cancellation.type === "CUSTOM") {
      const eligibility = cancellation.refundEligibility.find((refund) => {
        const startTimestamp = refund.startTimestamp ? new Date(refund.startTimestamp).getTime() : null;
        const endTimestamp = refund.endTimestamp ? new Date(refund.endTimestamp).getTime() : null;

        return (startTimestamp === null || currentTime >= startTimestamp) && (endTimestamp === null || currentTime < endTimestamp);
      });

      if (eligibility) {
        if (eligibility.percentageRefundable > 0) {
          const refundDeadline = eligibility.startTimestamp ? moment(eligibility.startTimestamp).format("h:mm A [on] MMM D, YYYY") : null;

          if (refundDeadline) {
            return `${t("trips.myTrips.localExperiences.tourDetails.cancellation.freeCancellationBefore")} ${refundDeadline}`;
          } else {
            return t("trips.myTrips.localExperiences.tourDetails.cancellation.freeCancellation");
          }
        } else {
          return t("trips.myTrips.localExperiences.tourDetails.cancellation.noRefundAvailable");
        }
      }

      return t("trips.myTrips.localExperiences.tourDetails.cancellation.refundCouldNotDetermined");
    }

    return t("trips.myTrips.localExperiences.tourDetails.cancellation.notRecognized");
  };

  return {
    loadings,
    fetchProductInfo,
    viatorProductInfo,
    fetchProductAvailability,
    viatorProductAvailability,
    exchangeRates,
    successfullBooking,
    fetchProductBookingHold,
    paymentSessionToken,
    bookingConfirmRequest,
    setBookingConfirm,
    setBookingConfirmLoading,
    showInfoModal,
    setBookingInfoModal,
    confirmPayment,
    viatorBookingInfo,
    availableDate,
    changeAvailableDate,
    selectedHour,
    changeSelectedHour,
    locations,
    getCancellationPolicy,
    modalVisible,
    paymentFailed,
    setPaymentFailedModal,
  };
};

export default useViatorApi;
