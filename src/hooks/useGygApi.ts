import { providers } from "@tripian/core";
import Model, { Providers } from "@tripian/model";
import { useCallback, useEffect, useState } from "react";
import adyen from "adyen-cse-js";
import { saveNotification } from "../redux/action/trip";
import { useDispatch } from "react-redux";
import moment from "moment";
import useReservation from "./useReservation";
import useTranslate from "./useTranslate";

export type GygLoader = {
  tourCatalogLoader: boolean;
  tourInfoLoader?: boolean;
  tourDataLoader?: boolean;
  tourDetailsLoader?: boolean;
  bookingLoader?: boolean;
  paymentLoader?: boolean;
};

export const useGygApi = (cityId?: number, cityName?: string, arrivalDatetime?: string, departureDatetime?: string, numberOfAdults?: number, numberOfChildren?: number | null) => {
  const [gygToursCatalog, setGygToursCatalog] = useState<Providers.Gyg.CatalogGroup[]>();
  const [gygTourInfo, setGygTourInfo] = useState<{
    tour?: Providers.Gyg.Tour;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [gygLoaders, setGygLoaders] = useState<GygLoader>({ tourCatalogLoader: false });
  const [gygTourOptionDetails, setGygTourOptionDetails] = useState<
    Array<{
      option: Providers.Gyg.TourOption;
      availabilities: Providers.Gyg.TourAvailabilityEx[];
      pricings?: Providers.Gyg.TourOptionPricing;
    }>
  >();
  const [gygTourOptions, setGygTourOptions] = useState<Providers.Gyg.TourOptionNew[]>();
  const [gygTourPriceBreakdown, setGygTourPriceBreakdown] = useState<Providers.Gyg.TourPriceBreakdown>();
  const [gygBookingInfo, setGygBookingInfo] = useState<Providers.Gyg.TourBooking | undefined>();
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>();
  // const [gygTourData, setGygTourData] = useState<Providers.Gyg.TourData | undefined>(undefined);

  const [gygTourData, setGygTourData] = useState<Providers.Gyg.TourData | undefined>(undefined);

  const [successfullBooking, setSuccessfullBooking] = useState<boolean>(false);

  const { reservationAdd } = useReservation(cityId);
  const dispatch = useDispatch();

  const { t } = useTranslate();

  const resetBookingState = () => {
    setGygTourOptionDetails(undefined);
    setGygBookingInfo(undefined);
  };

  useEffect(() => {
    if (cityName && arrivalDatetime && departureDatetime && numberOfAdults && window.tconfig.SHOW_TOURS_AND_TICKETS) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.GYG)) {
        setGygLoaders({ tourCatalogLoader: true });
        providers.gyg
          ?.toursAll(cityName, undefined, undefined, {
            start: moment(arrivalDatetime).format("YYYY-MM-DDThh:mm:ss"),
            end: moment(departureDatetime).format("YYYY-MM-DDThh:mm:ss"),
          })
          .then((tours: Providers.Gyg.CatalogGroup[]) => {
            if (tours.length > 0) {
              setGygToursCatalog(tours);
              setAdultCount(numberOfAdults);
              setChildrenCount(numberOfChildren || undefined);
            }
          })
          .catch((gygFetchToursError) => {
            console.log("gygFetchToursError", gygFetchToursError);
            // dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygFetchToursError", "Get Your Guide Fetch Tours", "An error occured. Please try again later."));
          })
          .finally(() => {
            setGygLoaders({ tourCatalogLoader: false });
          });
      }
    }
  }, [arrivalDatetime, cityName, departureDatetime, dispatch, numberOfAdults, numberOfChildren]);

  const fetchGygTourInfo = useCallback(
    async (bookingId: string) => {
      setGygLoaders({ ...gygLoaders, tourInfoLoader: true });

      resetBookingState();

      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.GYG)) {
        if (providers.gyg)
          try {
            try {
              const tour = await providers.gyg.tour(Number(bookingId));
              setGygTourInfo((prevState) => ({
                ...prevState,
                tour,
              }));
              return true;
            } catch (gygFetchTourError) {
              // console.log("gygFetchTourError", gygFetchTourError);
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygFetchTourError", "Get Your Guide Fetch Tour", gygFetchTourError as string));
              return false;
            }
          } finally {
            setGygLoaders({ ...gygLoaders, tourInfoLoader: false });
          }

        // return Promise.resolve(true);
      }

      return Promise.resolve(true);
    },
    [dispatch, gygLoaders]
  );

  const fetchTourOptionsWithDetails = async (tourId: number, startDate: string, endDate: string, adult: number, children?: number) => {
    setGygLoaders({ ...gygLoaders, tourDetailsLoader: true });
    const totalTravellerCount = adult + (children || 0);

    resetBookingState();

    const newGygTourInfoDetails: Array<{
      option: Providers.Gyg.TourOption;
      availabilities: Providers.Gyg.TourAvailabilityEx[];
      pricings?: Providers.Gyg.TourOptionPricing;
    }> = [];

    if (providers.gyg) {
      const tourAvailabilities: Providers.Gyg.TourAvailabilityEx[] = await providers.gyg.tourAvailabilities(
        tourId,
        moment(startDate).startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        moment(endDate).endOf("day").format("YYYY-MM-DDTHH:mm:ss")
      );

      if (tourAvailabilities.length > 0) {
        const tourOptions: Providers.Gyg.TourOption[] = await providers.gyg.options(tourId);

        const tourOptionPricingPromises: Promise<Providers.Gyg.TourOptionPricing>[] = [];

        tourOptions.forEach((tourOption) => {
          const tourOptionsResponse = providers.gyg!.optionPricings(tourOption.option_id);

          tourOptionPricingPromises.push(tourOptionsResponse);
          newGygTourInfoDetails.push({ option: tourOption, availabilities: [] });
        });

        await Promise.all(tourOptionPricingPromises)
          .then((tourOptionPricingResponse) => {
            newGygTourInfoDetails.forEach((info, index) => {
              // console.log('index:', index);
              const currentOptionPricing = tourOptionPricingResponse[index];

              if (currentOptionPricing.total_minimum_participants <= totalTravellerCount) {
                // console.log('currentOptionPricing:', currentOptionPricing);
                const currentAvailabilities = tourAvailabilities.filter((ta) => ta.pricing_id === currentOptionPricing.pricing_id);

                // console.log('currentAvailabilities', currentAvailabilities);
                newGygTourInfoDetails[index].pricings = currentOptionPricing;
                newGygTourInfoDetails[index].availabilities.push(...currentAvailabilities);
              }
            });
          })
          .catch((gygFetchOptionDetailsError) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygFetchOptionDetailsError", "Get Your Guide Fetch Option Details", gygFetchOptionDetailsError as string));
            setErrorMessage("something went wrong");
          })
          .finally(() => {
            setGygLoaders({ ...gygLoaders, tourDetailsLoader: false });
          });

        const availablePricings = newGygTourInfoDetails.filter((pricings) => pricings.availabilities.length > 0);

        setGygTourOptionDetails(availablePricings);
      } else {
        setGygLoaders({ ...gygLoaders, tourDetailsLoader: false });
        setGygTourOptionDetails([]);
      }

      setAdultCount(adult);
      setChildrenCount(children);

      /**
       * TEST providers.gyg.tourData
       */
      // providers.gyg.tourData(tourId, "2023-01-26T00:00:00", "2023-01-28T23:59:59");
    }
  };

  const gygTourBooking = async (bookingRequest: Providers.Gyg.TourBookingRequest): Promise<boolean> => {
    setGygLoaders({ ...gygLoaders, tourDetailsLoader: false, bookingLoader: true });

    try {
      if (providers.gyg) {
        const res = await providers.gyg.bookingAdd(bookingRequest);
        if ((res as any).status === "ERROR" && (res as any).errors) {
          const errorMessage = (res as any).errors[0].errorMessage;
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygBookingRequestError", "Get Your Guide Booking Request", errorMessage as string));
          return false;
        } else if ((res as any)._metadata && (res as any)._metadata.status === "OK" && (res as any).data) {
          setGygBookingInfo((res as any).data);
          return true;
        } else {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygBookingRequestError", "Get Your Guide Booking Request", "Unexpected response format from server"));
          return false;
        }
      } else {
        setErrorMessage("something went wrong");
        return false;
      }
    } catch (error) {
      dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygBookingRequestError", "Get Your Guide Booking Request", error as string));
      return false;
    } finally {
      setGygLoaders({ ...gygLoaders, tourDetailsLoader: false, bookingLoader: false });
    }
  };

  const fetchGygTourOptions = useCallback(
    (tourId: number, startDate: string, endDate?: string): Promise<Boolean> => {
      setGygLoaders({ ...gygLoaders, tourDetailsLoader: true });
      if (window.tconfig.SHOW_TOURS_AND_TICKETS && providers.gyg) {
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.GYG)) {
          return providers.gyg
            .tourOptions(tourId, moment(startDate).format("YYYY-MM-DDThh:mm:ss"), endDate ? moment(endDate).format("YYYY-MM-DDThh:mm:ss") : undefined)
            .then((data) => {
              setGygTourOptions(data.data.tour_options);
              return true;
            })
            .catch((gygFetchTourOptionsError) => {
              dispatch(
                saveNotification(Model.NOTIFICATION_TYPE.ERROR, "gygTourOptionsRequestError", "Get Your Guide Tour Options Request Error", gygFetchTourOptionsError as string)
              );
              return false;
            })
            .finally(() => {
              setGygLoaders({ ...gygLoaders, tourDetailsLoader: false });
            });
        }
      }

      return Promise.resolve(true);
    },
    [dispatch, gygLoaders]
  );

  const fetchGygTourPriceBreakdown = useCallback(
    (tourId: number, tourOptionsRequest: Providers.Gyg.TourPriceBreakdownRequest) => {
      setGygLoaders({ ...gygLoaders, tourDetailsLoader: true });

      if (providers.gyg) {
        providers.gyg
          ?.tourPriceBreakdown(tourId, tourOptionsRequest)
          .then((res: Providers.Gyg.TourPriceBreakdown) => {
            setGygTourPriceBreakdown(res);
          })
          .catch((gygTourOptionsRequestError) => {
            dispatch(
              saveNotification(
                Model.NOTIFICATION_TYPE.ERROR,
                "gygTourPriceBreakDownRequestError",
                "Get Your Guide Tour Price Breakdown Request Error",
                gygTourOptionsRequestError as string
              )
            );
          })
          .finally(() => {
            setGygLoaders({ ...gygLoaders, tourDetailsLoader: false });
          });
      } else {
        setErrorMessage("something went wrong");
        setGygLoaders({ ...gygLoaders, tourDetailsLoader: false });
      }
    },
    [dispatch, gygLoaders]
  );

  const paymentConfiguration = (): Promise<string> | undefined => providers.gyg?.paymentConfiguration().then((result) => result[0].public_key);

  const confirmPayment = async (data: Providers.Gyg.TourShoppingFormData) => {
    setGygLoaders({ ...gygLoaders, paymentLoader: true });

    const publicKey = (await paymentConfiguration()) || "";

    const newCreditCard = { ...data.creditCard };
    newCreditCard.generationtime = new Date().toISOString();

    // Pass it through the Adyen library
    const cseInstance = adyen.createEncryption(publicKey, {});
    // encrypted payment data
    const encryptedData: string = cseInstance.encrypt(newCreditCard);

    const cartRequest: Providers.Gyg.TourBookingCartRequest = {
      base_data: {
        cnt_language: "en",
        currency: "USD",
      },
      data: {
        shopping_cart: {
          shopping_cart_id: gygBookingInfo?.bookings.shopping_cart_id || 0,
          billing: {
            salutation_code: "m",
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            is_company: false,
            company_name: "Tripian",
            invoice: false,
            address_line_1: data.user.address_line_1,
            address_line_2: "",
            city: data.user.city,
            postal_code: data.user.postal_code,
            state: "California",
            country_code: data.user.country_code,
            phone_number: data.user.phone_number,
          },
          traveler: {
            salutation_code: "m",
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            phone_number: data.user.phone_number,
          },
          payment: {
            encrypted_credit_card: {
              format: "adyen",
              data: encryptedData,
            },
          },
        },
      },
    };
    providers.gyg
      ?.cartAdd(cartRequest)
      ?.then((reservationInfo: Providers.Gyg.TourBookingCart) => {
        setGygBookingInfo(undefined);
        if (reservationInfo && gygTourData) {
          const saveData: Providers.Gyg.TourReservationDetails = {
            data: {
              shopping_cart: {
                ...reservationInfo,
                city_name: cityName || "",
                tour_image: gygTourData?.tour.pictures[0].url || "",
                tour_name: gygTourData?.tour.title || "",
              },
            },
          };

          reservationAdd({ key: Model.PROVIDER_NAME.GYG, /* tripHash: tripReference?.tripHash || "", poiId: 0, */ provider: Model.PROVIDER_NAME.GYG, value: saveData }, false).then(
            () => {
              setGygLoaders({ ...gygLoaders, paymentLoader: false });
              setSuccessfullBooking(true);
              dispatch(
                saveNotification(
                  Model.NOTIFICATION_TYPE.SUCCESS,
                  t("notification.gygReservationSuccess.name"),
                  t("notification.gygReservationSuccess.title"),
                  t("notification.gygReservationSuccess.message")
                )
              );
            }
          );
          alert("Reservation created successfully.");
        } else {
          dispatch(
            saveNotification(
              Model.NOTIFICATION_TYPE.ERROR,
              t("notification.gygReservationError.name"),
              t("notification.gygReservationError.title"),
              t("notification.gygReservationError.message")
            )
          );
          setGygLoaders({ ...gygLoaders, paymentLoader: false });
        }
      })
      .catch((gygReservationError) => {
        dispatch(
          saveNotification(
            Model.NOTIFICATION_TYPE.ERROR,
            t("notification.gygReservationError.name"),
            t("notification.gygReservationError.title"),
            t("notification.gygReservationError.message")
          )
        );
        setGygLoaders({ ...gygLoaders, paymentLoader: false });
      });
  };

  const fetchGygTourDataCombo = useCallback(
    (tourId: number): Promise<Boolean> => {
      setGygLoaders({ ...gygLoaders, tourDataLoader: true });
      setGygTourData(undefined);
      if (/*tripReference && */ window.tconfig.SHOW_TOURS_AND_TICKETS && providers.gyg) {
        if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.GYG)) {
          return providers.gyg
            .tourData(tourId)
            .then((data) => {
              setGygTourData(data);
              return true;
            })
            .catch((gygFetchTourDataError) => {
              dispatch(
                saveNotification(Model.NOTIFICATION_TYPE.ERROR, t("notification.gygFetchTourDataError.name"), t("notification.gygFetchTourDataError.title"), gygFetchTourDataError)
              );
              setErrorMessage(gygFetchTourDataError);
              return false;
            })
            .finally(() => {
              setGygLoaders({ ...gygLoaders, tourDataLoader: false });
            });
        }
      }

      return Promise.resolve(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    adultCount,
    childrenCount,
    errorMessage,
    gygLoaders,
    gygTourInfo,
    gygTourOptionDetails,
    gygBookingInfo,
    gygToursCatalog,
    gygTourData,
    confirmPayment,
    fetchTourOptionsWithDetails,
    gygTourBooking,
    fetchGygTourInfo,
    fetchGygTourDataCombo,
    successfullBooking,
    fetchGygTourOptions,
    fetchGygTourPriceBreakdown,
    gygTourOptions,
    gygTourPriceBreakdown,
  };
};
