import Model from "@tripian/model";

interface IConfig {
  /**
   * Static Configs
   */
  HOSTNAME: string;
  TRIPIAN_API_URL: string;
  TRIPIAN_API_KEY: string;

  DOMAIN_ORIGIN: string; // window.location.origin,
  DOMAIN_ROUTER_BASE_NAME: string; // "/app"

  /**
   * White Label Configs
   */
  /** TODO */
  BRAND_NAME: string;

  IMAGE_PATHS: {
    LOGO_PATH_DARK: string;
    LOGO_PATH_LIGHT: string;
    FORM_HEADER_IMG_URL?: string;
    FORM_BG_IMG_URL?: string;
    APP_BACKGROUND_IMG_URL?: string;
  };

  COGNITO: {
    CLIENT_ID: string; // "7cf4dk7913ftha23q515attg7j",
    DOMAIN: string; // "dev-ripianone"
    IDENTITY_PROVIDERS: string[]; // ['Google', 'SignInWithApple']
    REGION: string; // "eu-west-1"
  };
  GOOGLE_ANALYTICS_URL: string;
  GOOGLE_ANALYTICS_KEY: string;

  THEME: {
    dark: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      info: string;
      danger: string;
      textPrimary: string;
      background: string;
      headerTextColor: string;
      headerBg: string;
    };
    light: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      info: string;
      danger: string;
      textPrimary: string;
      background: string;
      headerTextColor: string;
      headerBg: string;
    };
  };

  AVAILABLE_THEMES: Array<"dark" | "light">;

  LANGUAGES: string[];

  ROOT_PATH?: string;
  DEFAULT_DESTINATION_ID?: number;
  REVERSE_PROXY_URL: string;
  BRAND_URL?: string;
  TOS_URL?: string;
  PP_URL?: string;
  LANDING_PAGE_URL?: string;
  DEALS_PAGE_URL?: string;
  MENU_LINKS?: Record<string, Model.MenuLink[]>;

  /** TODO */
  PROVIDERS: {
    tourAndTicket: Model.ProviderObject[];
    accommodation: Model.ProviderObject[];
    restaurant: Model.ProviderObject[];
    transportation: Model.ProviderObject[];
  };

  /**
   * Base Features
   */
  SHOW_REGISTER: boolean;
  SHOW_LOGIN: boolean;
  SHOW_SIDE_NAV: boolean;
  SHOW_HOME: boolean;
  SHOW_USER_PROFILE: boolean;
  SHOW_CHANGE_PASSWORD: boolean;
  SHOW_TRIP_MODE_QUESTION: boolean;
  SHOW_CREATE_TRIP: boolean;
  SHOW_UPDATE_TRIP: boolean;
  SHOW_OVERVIEW: boolean;
  SHOW_OFFERS: boolean;
  SHOW_STEP_CARD_THUMBS: boolean;
  SHOW_STEP_SCORE_DETAIL: boolean;
  SHOW_TRAVEL_GUIDE: boolean;
  SHOW_VOUCHER: boolean;
  SHOW_SAVE_TRIP: boolean;
  SHARED_TRIP: boolean;
  SHOW_NOTIFICATION_SETTINGS: boolean;
  QR_READER: "business" | "customer";

  LOGIN_WITH_TOKEN: boolean;
  LOGIN_WITH_HASH: boolean;
  SAVE_SESSION: boolean;

  /**
   * Providers
   */
  SHOW_TOURS_AND_TICKETS: boolean;
  SHOW_RESTAURANT_RESERVATIONS: boolean;
  SHOW_ACCOMMODATION_POIS: boolean;
  SHOW_CAR_RENT_POIS: boolean; // Without UBER
  SHOW_BOOK_A_RIDE: boolean; // Just UBER

  TOUR_TICKET_PROVIDER_IDS: Model.PROVIDER_ID[];
  RESTAURANT_RESERVATION_PROVIDER_IDS: Model.PROVIDER_ID[];
  ACCOMMODATION_PROVIDER_ID: Model.PROVIDER_ID;
  CAR_RENT_PROVIDER_ID: Model.PROVIDER_ID;

  T: Model.TranslationList;
}

export default IConfig;
