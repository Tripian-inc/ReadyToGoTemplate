import Model from "@tripian/model";
import IConfig from "./IConfig";

const staticLocalConfig: IConfig = {
  // TODO
  BRAND_NAME: "",

  /**
   * Static Configs
   */

  // if readable from .env, use it
  // else replace it with window.location.hostname
  HOSTNAME: process.env.REACT_APP_HOSTNAME || window.location.hostname,
  TRIPIAN_API_URL: process.env.REACT_APP_API_URL || "",
  TRIPIAN_API_KEY: "",

  DOMAIN_ORIGIN: window.location.origin,
  DOMAIN_ROUTER_BASE_NAME: "",

  /**
   * White Label Configs
   */

  IMAGE_PATHS: {
    LOGO_PATH_DARK: "",
    LOGO_PATH_LIGHT: "",
  },

  COGNITO: {
    CLIENT_ID: "",
    DOMAIN: "",
    IDENTITY_PROVIDERS: [],
    REGION: "",
  },
  GOOGLE_ANALYTICS_URL: "",
  GOOGLE_ANALYTICS_KEY: "",

  THEME: {
    dark: {
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      info: "",
      danger: "",
      textPrimary: "",
      background: "",
      headerBg: "",
      headerTextColor: "",
    },
    light: {
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      info: "",
      danger: "",
      textPrimary: "",
      background: "",
      headerBg: "",
      headerTextColor: "",
    },
  },

  AVAILABLE_THEMES: [],

  LANGUAGES: [],

  REVERSE_PROXY_URL: "https://5emjjgg3z0.execute-api.eu-west-1.amazonaws.com",

  /**
   * Base Features
   */
  SHOW_REGISTER: true,
  SHOW_LOGIN: true,
  SHOW_SIDE_NAV: true,
  SHOW_HOME: true,
  SHOW_USER_PROFILE: true,
  SHOW_CHANGE_PASSWORD: true,
  SHOW_TRIP_MODE_QUESTION: true,
  SHOW_CREATE_TRIP: true,
  SHOW_UPDATE_TRIP: true,
  SHOW_OVERVIEW: true,
  SHOW_OFFERS: true,
  SHOW_STEP_CARD_THUMBS: true,
  SHOW_STEP_SCORE_DETAIL: true,
  SHOW_TRAVEL_GUIDE: true,
  SHOW_VOUCHER: false,
  SHOW_SAVE_TRIP: false,
  SHARED_TRIP: true,
  SHOW_NOTIFICATION_SETTINGS: false,
  QR_READER: "customer",

  LOGIN_WITH_TOKEN: true,
  LOGIN_WITH_HASH: false,
  SAVE_SESSION: true,

  WIDGET_THEME_1: false,

  /**
   * Providers
   */
  PROVIDERS: {
    tourAndTicket: [],
    accommodation: [],
    restaurant: [],
    transportation: [],
  },

  SHOW_TOURS_AND_TICKETS: false,
  SHOW_RESTAURANT_RESERVATIONS: false,
  SHOW_ACCOMMODATION_POIS: false,
  SHOW_CAR_RENT_POIS: true,
  SHOW_BOOK_A_RIDE: false,

  TOUR_TICKET_PROVIDER_IDS: [], // If SHOW_TOURS_AND_TICKETS === false, will ignore it
  RESTAURANT_RESERVATION_PROVIDER_IDS: [],
  ACCOMMODATION_PROVIDER_ID: Model.PROVIDER_ID.BOOK_BARBADOS, // If SHOW_ACCOMMODATION_POIS === false, will ignore it
  CAR_RENT_PROVIDER_ID: Model.PROVIDER_ID.BOOK_BARBADOS, // If SHOW_CAR_RENT_POIS === false, will ignore it

  SOCIAL_LOGIN: false,

  T: {
    langCodes: [],
    translations: {},
  },
};

// Check api url defined
if (staticLocalConfig.TRIPIAN_API_URL === "") {
  console.log("process.env", process.env);
  console.error("process.env.REACT_APP_API_URL (TRIPIAN_API_URL) is undefined!");
  throw new Error("process.env.REACT_APP_API_URL (TRIPIAN_API_URL) is undefined!");
}

export { staticLocalConfig };
