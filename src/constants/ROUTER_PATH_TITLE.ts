import IRouteProps from "./IRouteProps";

const capitalizeFirstLetter = (str: string) => (str.length === 0 ? "" : str.charAt(0).toUpperCase() + str.slice(1));

export const INDEX: IRouteProps = { PATH: "/", TITLE: () => capitalizeFirstLetter(window.tconfig.BRAND_NAME) };
export const LANDING: IRouteProps = { PATH: "/landing", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const REGISTER: IRouteProps = { PATH: "/register", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const LOGIN: IRouteProps = { PATH: "/login", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const WIDGETS: IRouteProps = { PATH: "/widgets", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const LOGIN_WITH_HASH: IRouteProps = { PATH: "/login-with-hash", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const USER_PROFILE: IRouteProps = { PATH: "/user-profile", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const TRIPS: IRouteProps = { PATH: "/trips", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const CREATE_TRIP: IRouteProps = { PATH: "/create-trip", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const UPDATE_TRIP: IRouteProps = { PATH: "/update-trip", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const OUR_PICKS_FOR_YOU: IRouteProps = { PATH: "/our-picks-for-you", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const TRAVEL_GUIDE: IRouteProps = { PATH: "/travel", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const OVERVIEW: IRouteProps = { PATH: "/overview", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const TRIP_PLAN: IRouteProps = { PATH: "/trip", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const TRIP_CLONE: IRouteProps = { PATH: "/trip-copy", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const MY_WALLET: IRouteProps = { PATH: "/my-wallet", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const CAMPAIGN_OFFERS: IRouteProps = {
  PATH: "/campaign-offers",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};
export const QR_READER: IRouteProps = { PATH: "/qr-reader", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const QR_WRITER: IRouteProps = { PATH: "/qr-writer", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`, HEADER: (value) => `${value}` };
export const OFFER_PAYMENT: IRouteProps = {
  PATH: "/offer-payment",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};

export const TRAVEL_COMPANIONS: IRouteProps = {
  PATH: "/travel-companions",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};
export const MY_FEEDBACK: IRouteProps = {
  PATH: "/my-feedback",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};
export const FEEDBACK_PAGE: IRouteProps = {
  PATH: "/feedback",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};

export const MY_BOOKINGS_PAGE: IRouteProps = {
  PATH: "/my-bookings",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};

export const CITY_INFO: IRouteProps = {
  PATH: "/city-info",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
  HEADER: (value) => `${value}`,
};

/* export const TOP_TEN: IRouteProps = { PATH: '/top-ten', TITLE: 'Tripian - Top Ten' }; */
/* export const TOURS: IRouteProps = { PATH: '/tours', TITLE: 'Tripian - Tours' }; */
export const LOCAL_EXPERIENCES: IRouteProps = { PATH: "/local-experiences", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const TOURS_AND_TICKETS: IRouteProps = {
  PATH: "/tours-and-tickets",
  TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}`,
};
export const GYGTOURS: IRouteProps = { PATH: "/gyg", TITLE: () => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + " Get Your Guide" };
export const PLACE_INFO: IRouteProps = { PATH: "/place", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const TOUR_INFO: IRouteProps = { PATH: "/product", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
/* export const CITY: IRouteProps = { PATH: "/city", TITLE: () => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + "Tripian - City Info" }; */
export const USE_TRIP_URL: IRouteProps = { PATH: "/use-trip-url", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const FORGOT_PASSWORD: IRouteProps = { PATH: "/forgot-password", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const NEW_PASSWORD: IRouteProps = { PATH: "/new-password", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const SOCIAL_LOGIN_REDIRECT: IRouteProps = { PATH: "/cognito-redirect", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const DELETE_USER: IRouteProps = { PATH: "/delete-user", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value}` };
export const NOT_FOUND: IRouteProps = { PATH: "*", TITLE: (value) => capitalizeFirstLetter(window.tconfig.BRAND_NAME) + ` ${value} :(` };
