import { api, init, providers } from "@tripian/core";
import Model, { helper } from "@tripian/model";
import "../../config";
import { clearLocalStorage, getLocalStorageToken, saveLocalStorageToken } from "./localStorages";
// import { allKeys } from "../../config/mockData";

export const setConfigList = async (): Promise<void> => {
  const apiConfigList: Model.ConfigList = await fetch(`${window.tconfig.TRIPIAN_API_URL}/misc/config-list?domain=${window.tconfig.HOSTNAME}`)
    .then((response) => response.json())
    .then((d) => d.data)
    .catch((err) => {
      console.error(`/misc/config-list?domain=${window.tconfig.HOSTNAME}`, err);
      throw new Error(`/misc/config-list?domain=${window.tconfig.HOSTNAME}`, err);
    });

  if (apiConfigList === undefined || apiConfigList.apiKey === undefined || apiConfigList.apiKey === "") {
    console.error("apiConfigList", apiConfigList);
    throw new Error("apiConfigList.apiKey not found!");
  }
  window.tconfig.TRIPIAN_API_KEY = apiConfigList.apiKey;

  const DEFAULT_COLORS = {
    primary: "#e9314a",
    secondary: "#ffeef0",
    success: "#2da52deb",
    warning: "#f9a938",
    info: "#333232ff",
    danger: "#e54e53",
    textPrimary: "#434b55",
    background: "#f5f5f5",
    headerBg: "f5f5f5",
    headerTextColor: "#000000",
  };

  const defaultTosUrl = "https://www.tripian.com/terms-conditions.html";
  const defaultPpUrl = "https://www.tripian.com/privacy-policy.html";

  /**
   * White Label Configs
   */
  // TODO
  window.tconfig.BRAND_NAME = apiConfigList.whiteLabels.brandName;

  window.tconfig.IMAGE_PATHS = {
    LOGO_PATH_DARK: apiConfigList.whiteLabels.imagePaths.logoPathDark,
    LOGO_PATH_LIGHT: apiConfigList.whiteLabels.imagePaths.logoPathLight,
    FORM_HEADER_IMG_URL: apiConfigList.whiteLabels.imagePaths.formHeaderImgUrl === "" ? undefined : apiConfigList.whiteLabels.imagePaths.formHeaderImgUrl,
    FORM_BG_IMG_URL: apiConfigList.whiteLabels.imagePaths.formBgImgUrl === "" ? undefined : apiConfigList.whiteLabels.imagePaths.formBgImgUrl,
    APP_BACKGROUND_IMG_URL: apiConfigList.whiteLabels.imagePaths.appBackgroundImgUrl === "" ? undefined : apiConfigList.whiteLabels.imagePaths.appBackgroundImgUrl,
  };

  window.tconfig.GOOGLE_ANALYTICS_URL = apiConfigList.whiteLabels.googleAnalyticsUrl.customer;
  window.tconfig.GOOGLE_ANALYTICS_KEY = apiConfigList.whiteLabels.googleAnalyticsKey.customer;
  window.tconfig.COGNITO = {
    CLIENT_ID: apiConfigList.whiteLabels.cognito.clientId,
    DOMAIN: apiConfigList.whiteLabels.cognito.domain,
    IDENTITY_PROVIDERS: apiConfigList.whiteLabels.cognito.identityProviders,
    REGION: apiConfigList.whiteLabels.cognito.region,
  };

  window.tconfig.THEME = {
    dark: {
      primary: apiConfigList.whiteLabels.theme?.dark.primary || DEFAULT_COLORS.primary,
      secondary: apiConfigList.whiteLabels.theme?.dark.secondary || DEFAULT_COLORS.secondary,
      success: apiConfigList.whiteLabels.theme?.dark.success || DEFAULT_COLORS.success,
      warning: apiConfigList.whiteLabels.theme?.dark.warning || DEFAULT_COLORS.warning,
      info: apiConfigList.whiteLabels.theme?.dark.info || DEFAULT_COLORS.info,
      danger: apiConfigList.whiteLabels.theme?.dark.danger || DEFAULT_COLORS.danger,
      textPrimary: apiConfigList.whiteLabels.theme?.dark.textPrimary || DEFAULT_COLORS.textPrimary,
      background: apiConfigList.whiteLabels.theme?.dark.background || DEFAULT_COLORS.background,
      headerBg: apiConfigList.whiteLabels.theme?.dark.headerBg || DEFAULT_COLORS.headerBg,
      headerTextColor: apiConfigList.whiteLabels.theme?.dark.headerTextColor || DEFAULT_COLORS.headerTextColor,
    },
    light: {
      primary: apiConfigList.whiteLabels.theme?.light.primary || DEFAULT_COLORS.primary,
      secondary: apiConfigList.whiteLabels.theme?.light.secondary || DEFAULT_COLORS.secondary,
      success: apiConfigList.whiteLabels.theme?.light.success || DEFAULT_COLORS.success,
      warning: apiConfigList.whiteLabels.theme?.light.warning || DEFAULT_COLORS.warning,
      info: apiConfigList.whiteLabels.theme?.light.info || DEFAULT_COLORS.info,
      danger: apiConfigList.whiteLabels.theme?.light.danger || DEFAULT_COLORS.danger,
      textPrimary: apiConfigList.whiteLabels.theme?.light.textPrimary || DEFAULT_COLORS.textPrimary,
      background: apiConfigList.whiteLabels.theme?.light.background || DEFAULT_COLORS.background,
      headerBg: apiConfigList.whiteLabels.theme?.light.headerBg || DEFAULT_COLORS.headerBg,
      headerTextColor: apiConfigList.whiteLabels.theme?.light.headerTextColor || DEFAULT_COLORS.headerTextColor,
    },
  };

  window.tconfig.AVAILABLE_THEMES = apiConfigList.whiteLabels.availableThemes;

  window.tconfig.LANGUAGES = apiConfigList.whiteLabels.languages;

  window.tconfig.ROOT_PATH = apiConfigList.whiteLabels.rootPath === "" ? undefined : apiConfigList.whiteLabels.rootPath;
  window.tconfig.DEFAULT_DESTINATION_ID = apiConfigList.whiteLabels.defaultDestinationId === 0 ? undefined : apiConfigList.whiteLabels.defaultDestinationId;
  window.tconfig.REVERSE_PROXY_URL = apiConfigList.whiteLabels.reverseProxyUrl;
  window.tconfig.BRAND_URL = apiConfigList.whiteLabels.brandUrl;
  window.tconfig.TOS_URL = apiConfigList.whiteLabels.tosUrl || defaultTosUrl;
  window.tconfig.PP_URL = apiConfigList.whiteLabels.ppUrl || defaultPpUrl;
  window.tconfig.LANDING_PAGE_URL = apiConfigList.whiteLabels.landingPageUrl === "" ? undefined : apiConfigList.whiteLabels.landingPageUrl;
  window.tconfig.DEALS_PAGE_URL = apiConfigList.whiteLabels.dealsPageUrl === "" ? undefined : apiConfigList.whiteLabels.dealsPageUrl;
  window.tconfig.MENU_LINKS = apiConfigList.whiteLabels.externalMenuLinks ?? undefined;

  /**
   * Providers
   */
  window.tconfig.PROVIDERS = apiConfigList.providers;
  // TEST
  /* window.tconfig.PROVIDERS.tourAndTicket = [
    { id: 4, name: "gyg", apiKey: "Yb8XauGtHKbBUEj4PGWRfrvzvmwKijdghHwWkjBVYTKmTFeR", apiUrl: "https://api.getyourguide.com/1", clientId: "", prod: true },
    { id: 6, name: "bookbarbados", apiKey: "ZUlpNGTnPszqLXMWq0r0j66Q4eEkUV9sYRSsfg/8Cts=", apiUrl: "https://admin.bookbarbados.com/gptour/api", clientId: "", prod: true },
  ]; */
  // TEST
  window.tconfig.SHOW_TOURS_AND_TICKETS = 0 < window.tconfig.PROVIDERS.tourAndTicket.length;
  window.tconfig.SHOW_RESTAURANT_RESERVATIONS = 0 < window.tconfig.PROVIDERS.restaurant.length;
  window.tconfig.SHOW_ACCOMMODATION_POIS = 0 < window.tconfig.PROVIDERS.accommodation.length;
  window.tconfig.SHOW_CAR_RENT_POIS = window.tconfig.PROVIDERS.transportation.some((x) => x.id !== Model.PROVIDER_ID.UBER);
  window.tconfig.SHOW_BOOK_A_RIDE = window.tconfig.PROVIDERS.transportation.some((x) => x.id === Model.PROVIDER_ID.UBER);

  window.tconfig.TOUR_TICKET_PROVIDER_IDS = window.tconfig.PROVIDERS.tourAndTicket.map((x) => x.id);
  window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS = window.tconfig.PROVIDERS.restaurant.map((x) => x.id);
  if (window.tconfig.SHOW_ACCOMMODATION_POIS) window.tconfig.ACCOMMODATION_PROVIDER_ID = window.tconfig.PROVIDERS.accommodation[0].id;
  if (window.tconfig.SHOW_CAR_RENT_POIS) {
    const carRentConfig = window.tconfig.PROVIDERS.transportation.find((x) => x.id !== Model.PROVIDER_ID.UBER);
    if (carRentConfig) {
      window.tconfig.CAR_RENT_PROVIDER_ID = carRentConfig.id;
    } else {
      console.warn("Imposisbble! SHOW_CAR_RENT_POIS true but there is no object without UBER!");
    }
  }

  /**
   * Base Features
   */
  window.tconfig.SHOW_CHANGE_PASSWORD = apiConfigList.baseFeatures.showChangePassword;
  window.tconfig.SHOW_CREATE_TRIP = apiConfigList.baseFeatures.showCreateTrip;
  window.tconfig.SHOW_HOME = apiConfigList.baseFeatures.showHome;
  window.tconfig.SHOW_LOGIN = apiConfigList.baseFeatures.showLogin;
  window.tconfig.SHOW_OFFERS = apiConfigList.baseFeatures.showOffers;
  window.tconfig.SHOW_OVERVIEW = apiConfigList.baseFeatures.showOverview;
  window.tconfig.SHOW_REGISTER = apiConfigList.baseFeatures.showRegister;
  window.tconfig.SHOW_SIDE_NAV = apiConfigList.baseFeatures.showSideNav;
  window.tconfig.SHOW_STEP_CARD_THUMBS = apiConfigList.baseFeatures.showStepCardThumbs;
  window.tconfig.SHOW_TRIP_MODE_QUESTION = apiConfigList.baseFeatures.showTripModeQuestion;
  window.tconfig.SHOW_UPDATE_TRIP = apiConfigList.baseFeatures.showUpdateTrip;
  window.tconfig.SHOW_USER_PROFILE = apiConfigList.baseFeatures.showUserProfile;
  window.tconfig.SHOW_STEP_SCORE_DETAIL = apiConfigList.baseFeatures.showStepScoreDetail;
  window.tconfig.SHOW_TRAVEL_GUIDE = apiConfigList.baseFeatures.showTravelGuide;
  window.tconfig.SHOW_VOUCHER = apiConfigList.baseFeatures.showVoucher;
  window.tconfig.SHOW_SAVE_TRIP = apiConfigList.baseFeatures.showSaveTrip;
  window.tconfig.SHARED_TRIP = apiConfigList.baseFeatures.sharedTrip;
  window.tconfig.SHOW_NOTIFICATION_SETTINGS = window.location.hostname.includes("-dev") || window.location.hostname.includes("localhost");

  window.tconfig.LOGIN_WITH_TOKEN = apiConfigList.baseFeatures.loginWithToken;
  window.tconfig.LOGIN_WITH_HASH = apiConfigList.baseFeatures.loginWithHash;
  window.tconfig.SAVE_SESSION = apiConfigList.baseFeatures.saveSession;
  window.tconfig.QR_READER = apiConfigList.baseFeatures.qrReader;

  window.tconfig.WIDGET_THEME_1 = apiConfigList.baseFeatures.widgetTheme1;

  const apiTranslationList = await getTranslationList();

  window.tconfig.T = apiTranslationList;

  let langCode = localStorage.getItem("language");

  const langCodeKeys: string[] = window.tconfig.T.langCodes.map((l) => l.value);

  if (langCode === null || !langCodeKeys.includes(langCode)) {
    langCode = "en";
    localStorage.setItem("language", "en");
  }

  window.twindow.langCode = langCode;

  init(window.tconfig.TRIPIAN_API_URL, window.tconfig.TRIPIAN_API_KEY, undefined, true, langCode);
  /** Performance magic touch */
  api.citiesAll();

  /**
   * Muro
   */
  type MessageEventData = {
    mode: "light" | "dark";
    data: { theme: Model.Theme; logo: { dark: string; light: string } };
  };

  /* 
  Test
  const frame = document.getElementById('myframe');
  const eventData = {
    mode: "light",
    data: {
      dark: {
        primary: "#e9314a",
        secondary: "#ffeef0",
        success: "#2da52deb",
        warning: "#f9a938",
        info: "#333232",
        danger: "#e54e53",
        textPrimary: "#f5f5f5",
        background: "#140F21",
        headerBg: "#140F21",
        headerTextColor: "#f5f5f5",
      },
      light: {
        primary: "#e9314a",
        secondary: "#ffeef0",
        success: "#2da52deb",
        warning: "#f9a938",
        info: "#333232",
        danger: "#e54e53",
        textPrimary: "#434b55",
        background: "#ffffff",
        headerBg: "#ffffff",
        headerTextColor: "#00000",
      },
    },
  };
  frame.contentWindow.postMessage(eventData, "*"); 
  */

  window.addEventListener("message", (event) => {
    // IMPORTANT: check the origin of the data!
    /* console.log("MessageEvent", event);
    console.log("MessageEventOrigin", event.origin); */
    if (event.origin === "https://customer.tripian.com" || event.origin === "https://customer-dev.tripian.com") {
      // The data was sent from your site.
      // Data sent with postMessage is stored in event.data:

      /* console.log("MessageEventData", event.data); */
      const messageEventData: MessageEventData = event.data as MessageEventData;

      helper.setTheme(messageEventData.mode, messageEventData.data.theme);
      helper.setLogo(messageEventData.data.logo.dark, messageEventData.data.logo.light);
    } else {
      // The data was NOT sent from your site!
      // Be careful! Do not use it. This else branch is
      // here just for clarity, you usually shouldn't need it.
      return;
    }
  });
  /**
   * Muro
   */
};

export const getTranslationList = async (): Promise<Model.TranslationList> => {
  return fetch(`${window.tconfig.TRIPIAN_API_URL}/misc/frontend-translationsv2`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": window.tconfig.TRIPIAN_API_KEY,
    },
  })
    .then((response) => response.json())
    .then((d) => d.data)
    .catch((err) => {
      console.error(`/misc/frontend-translations"`, err);
      throw new Error(`/misc/frontend-translations`, err);
    });
};

const getLocalToken = async (): Promise<Model.Token | undefined> => {
  clearLocalStorage();
  let localToken: Model.Token | undefined = undefined;

  if (window.tconfig.LOGIN_WITH_TOKEN) {
    // http://localhost:3000/?access_token=eyJraWQiOiJcL2dMVURKRWlcL1hGZURLM1VnUWMzZ1VBU2NSTTJRd3E2ZmZSTnluWkE1RHM9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJlMjU5MDg3Ni04M2M0LTQxNzYtYWUzMy0yNTlhOTZjMWE0NzYiLCJldmVudF9pZCI6IjE0Yjg3NWMwLTQ5YWEtNGI4Yi04MmE5LTU0ZDdhZWE3YjViMCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2NTMwNDYwMDEsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX2lIVFhZS2paUyIsImV4cCI6MTY1NDI1NTc1NywiaWF0IjoxNjU0MTY5MzU3LCJqdGkiOiJjYTZkNmZlNC1kMDZlLTQwODMtYjQyMy0zZmJkNWJlOWZhMGUiLCJjbGllbnRfaWQiOiI3ZGZmcDAxM2pscTllYTRhYjBvZnF1a282aSIsInVzZXJuYW1lIjoiZTI1OTA4NzYtODNjNC00MTc2LWFlMzMtMjU5YTk2YzFhNDc2In0.MwhjSw_QIqh8nMmWcQnmIfp_oSYWA0l8xRFA0atEEDxmkx3YXz0InfilqQ0gF638ogh_UXNbo_6GgSdYOKWOTdqKQx1BPnE31c3M0r6NivFqet9iOH26CdjTbsvsvGYmKsVvv0eXsSG1h_PjFD4Bv9-Y_y5Ya52qbU4mKlkBk1BT12uAp9OaTabiIRGHdpvEc4KzrzU3RmPsVcWcBSdVEBhzV0PAOUItNdUoqpGgT_VyffPmvcVirpCFF1cpRHNYfsn7024vDssGnSSXrEIR1w1eEB4asxRgT9glqh_tUdTHSnlupDz-IX7kJ-FkEIQwD_2LDYQRN7Rde77CQjiQNQ&refresh_token=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.c-21drwjLdyi72VX15rzQPZyWDAd04BJ9Ydw-5zaY0kKa2nzfEhpBHTBUy05psE2MrWKOyt_-kk9Ifew4u2d0RfjSOnr71AfTocWtw6ml66JTBbC67D8qaey6k98L8TEO1RKn2NLKDml84yWlKw6yXk6p7zTM-lyMDcDzCuZ-xd87jT7vdHRuRxBz2suaV-yb9cwlkhw7lCMqHu7_O8l-a0aF9xTIIbgREYEydzbwB3fWQq8vnwkAS0Ob5m_RM-N2icX9qTsa0s7RMZvCljIMQWhjCGJuHAun-kHz1q3swqgmUH8nZYn171rLNCfrP9anadHQO_W2b-vSM5NRk9MyA.A_3aIJ8YSbH_0QaI.h04kKK4pAkZQS73e_l8lupE6my3Q18fTG3GiG3xqRCVytRxIojtdOoDKujjsjO_lBzhDYHnw_7JVhYZeRRkOYo-bsHviyYo7R9S7UK9lKpM35ooqU63ciEtyM_AY053W2N3mOa_ZIR9nxxKZtorXYA26bnTBVzA6WbOwjd0-sX0BwlsTMvo_G_BORoZ774nZ5IdfVxCmDQBK7TbjZDqY0E5mv5SWKhSrETSl2ojRZtX6gZ3KoysrXuO4mdVA08xlAT9upWCOQqnCjaiM__Zkcl47vLnG0TYlKRazJWfWIuRK1w1PN31d_T90xlTzPgCoCuPSYmfzaceb9TnhEgrCKBdYbm7jG7SF2yHS2nc6WCmkkex_LF1DKfxGDHnJGv7GodNyNpWqBAnaAcD0a2Mpc_2tSh46MLj12fK4D1UnMOPI9URngxPkMYN1avwGky4QVQob4TkC9X38LDfPqC_sW7OJr7R5d0jpZTuzI-LMqpuElDG9mvSnqrZjlYyLxc7rMP1xdsgauKEWKN1vw-wfLKugwheE4z2Qs3mcMTjEaTYDkym8VGr8_G-4nFWdvD8niXhpWhXf2CaQQpAQWHEfsci5-B8TNECi9MJK0u3ndTHJokYHDrqd0OhXdMXLshSUeVr2seHoKx3Ig8NTcjaxPNTCtcMrf4-LxD59XFngegKOov6muc8Dz1q-HXtWyGB4am4YF09G6SFKMnNPzkb5tx1XiFqrp_1zcxKuu60CKS2fDynvNrHIEZJFEy750tiDhnaI9_6KIGiQjmxgL-8tjWTHraSttPtFjxOhSDJeVPKJBxth3HgLqVuclktoA5YN_sXQtHeu8psUkLL3r8PR4ZzZWsCXrd6nQdaOETNZuCjCwzxAI1hMhLvVceydouFg7H-0ozO0MhgryNvU1twAWT8MJZ2sY5pI-QLZ5i9PThLjyCTa3BTSSnlJzqQV6TqLapKF7tfgjbYVESlMQLYqzIwDiR53mSXT73hpihoLKrw6-iv6ybIGimNi_75KPVdtUvAqR-IkbnF5UGPz_zUtrQH4caMThPnaYmn_LWXTezNOFndPDWFq1KQx1miTs5E0notMwjOysFGcNd67ggJfD84KN-ja6lquMAyukYhloczchAW3ZRHzujNtOm_6pCGaZakBiIUCKC_idv5UOPAWN4vo_PLx2yYZuNpM0wDR49D-cxu935jeJ3t5pvGHry44irbuTi7kXwAN5WBkpIsiMVzJwlx_R7UglU1cloT0mSoDzIapzXr2o9GJt2HKspLglOp1QMqXr8zKlbvehEHBHhhu_Vnz8duaEXnwLGrBpuCpGa0BeXrMVfInLQ.3hyvLct_nA9oAxWOeFfunA
    // http://localhost:3000/?unique_id=user_123
    const params = new URLSearchParams(window.location.search);
    const queryAccessToken = params.get("access_token");
    const queryRefreshToken = params.get("refresh_token");
    const uniqueId = params.get("unique_id");

    if (queryAccessToken && queryRefreshToken && queryAccessToken !== "" && queryRefreshToken !== "") {
      localToken = {
        idToken: queryAccessToken || "",
        expiresIn: 86400,
        refreshToken: queryRefreshToken || "",
        tokenType: "Bearer",
      };
    } else if (uniqueId && uniqueId !== "") {
      try {
        localToken = await api.lightRegisterLogin(uniqueId);
      } catch (error) {
        console.error("lightRegisterLogin.error", error);
      }
    }
  }

  if (localToken === undefined && window.tconfig.LOGIN_WITH_HASH) {
    if (window.location.pathname.startsWith("/trip/") || window.location.pathname.startsWith("/update-trip/")) {
      const paths = window.location.pathname.split("/");
      if (2 < paths.length) {
        const triphash = paths[2].split("!");
        try {
          localToken = await api.lightLoginHash(triphash[0]);
        } catch (error) {
          console.error("lightLoginHash.error", error);
        }
      }
    }
  }

  if (localToken === undefined) {
    localToken = getLocalStorageToken();
  } else {
    saveLocalStorageToken(localToken);
  }

  return localToken;
};

export const initial = async (): Promise<boolean> => {
  let langCode = localStorage.getItem("language") || "en";

  /**
   * Providers initial
   */

  // TourAndTicket GYG
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.GYG)) {
    const gygConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.GYG);
    // always true
    if (gygConfig) {
      const apiUrl = gygConfig.apiUrl;
      const apiKey = gygConfig.apiKey;
      const sandbox = !gygConfig.prod;
      providers.gygInit(apiUrl, apiKey, sandbox, window.tconfig.REVERSE_PROXY_URL, langCode);
    }
  }

  // Restaurant YELP
  if (window.tconfig.SHOW_RESTAURANT_RESERVATIONS) {
    const yelpConfig = window.tconfig.PROVIDERS.restaurant.find((x) => x.id === Model.PROVIDER_ID.YELP);
    if (yelpConfig) {
      const apiUrl = yelpConfig.apiUrl;
      const apiKey = yelpConfig.apiKey;
      const sandbox = !yelpConfig.prod;
      providers.yelpInit(apiUrl, apiKey, sandbox, window.tconfig.REVERSE_PROXY_URL, langCode);
    }
  }

  // TourAndTicket BOOKBARBADOS
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.BOOK_BARBADOS)) {
    const bbConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.BOOK_BARBADOS);
    // always true
    if (bbConfig) {
      const apiUrl = bbConfig.apiUrl;
      const apiKey = bbConfig.apiKey;
      const sandbox = !bbConfig.prod;
      await providers.bbInit(apiUrl, apiKey, sandbox, window.tconfig.REVERSE_PROXY_URL);
    }
  } else {
    // Accommodation BOOKBARBADOS
    if (window.tconfig.SHOW_ACCOMMODATION_POIS && window.tconfig.ACCOMMODATION_PROVIDER_ID === Model.PROVIDER_ID.BOOK_BARBADOS) {
      const bbConfig = window.tconfig.PROVIDERS.accommodation[0];
      const apiUrl = bbConfig.apiUrl;
      const apiKey = bbConfig.apiKey;
      const sandbox = !bbConfig.prod;
      await providers.bbInit(apiUrl, apiKey, sandbox, window.tconfig.REVERSE_PROXY_URL);
    } else {
      // Car BOOKBARBADOS
      if (window.tconfig.SHOW_CAR_RENT_POIS && window.tconfig.CAR_RENT_PROVIDER_ID === Model.PROVIDER_ID.BOOK_BARBADOS) {
        const bbConfig = window.tconfig.PROVIDERS.transportation.find((x) => x.id === Model.PROVIDER_ID.BOOK_BARBADOS);
        if (bbConfig) {
          const apiUrl = bbConfig.apiUrl;
          const apiKey = bbConfig.apiKey;
          const sandbox = !bbConfig.prod;
          await providers.bbInit(apiUrl, apiKey, sandbox, window.tconfig.REVERSE_PROXY_URL);
        } else {
          console.warn("Imposisbble! SHOW_CAR_RENT_POIS true, CAR_RENT_PROVIDER_ID is BOOK_BARBADOS but; there is no object with BOOK_BARBADOS!");
        }
      }
    }
  }

  // TourAndTicket TRAVELIFY
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.TRAVELIFY)) {
    const tfConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.TRAVELIFY);
    // always true
    if (tfConfig) {
      const apiUrl = tfConfig.apiUrl;
      const apiToken = tfConfig.apiKey;
      const sandbox = !tfConfig.prod;
      providers.travelifyInit(apiUrl, apiToken, sandbox, window.tconfig.REVERSE_PROXY_URL, tfConfig.clientId);
    }
  }

  // TourAndTicket VIATOR
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
    const viConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.VIATOR);
    // always true
    if (viConfig) {
      /* const apiUrl = "https://api.viator.com/partner";
      const apiToken = "ecb944f4-396a-42ec-a89c-3e59ef671465";
      const sandbox = false; */
      const apiUrl = viConfig.apiUrl;
      const apiToken = viConfig.apiKey;
      const sandbox = !viConfig.prod;
      providers.viatorInit(apiUrl, apiToken, sandbox, window.tconfig.REVERSE_PROXY_URL, langCode);
    }
  }

  // TourAndTicket Toristy
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.TORISTY)) {
    const toristyConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.TORISTY);
    // always true
    if (toristyConfig) {
      providers.toristyInit(toristyConfig.apiUrl, toristyConfig.apiKey, window.tconfig.REVERSE_PROXY_URL);
    }
  }

  // TourAndTicket Rezdy
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.REZDY)) {
    const rezdyConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.REZDY);
    // always true
    if (rezdyConfig) {
      providers.rezdyInit(rezdyConfig.apiUrl, rezdyConfig.apiKey, window.tconfig.REVERSE_PROXY_URL);
    }
  }

  // Videreo Videos
  if (window.location.hostname === "trial-dev.tripian.com") {
    providers.videreoInit("https://videreo.com", window.tconfig.REVERSE_PROXY_URL);
  }

  // Victory Events

  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VICTORY)) {
    const victoryConfig = window.tconfig.PROVIDERS.tourAndTicket.find((x) => x.id === Model.PROVIDER_ID.VICTORY);
    // always true
    if (victoryConfig) {
      providers.victoryInit(victoryConfig.apiUrl, victoryConfig.apiKey, window.tconfig.REVERSE_PROXY_URL);
    }
  }

  /**
   * Providers initial
   */

  let localToken = await getLocalToken();
  if (localToken) {
    try {
      api.setToken(localToken);
      const newToken = await api.refreshToken();
      saveLocalStorageToken(newToken);
      return true;
    } catch (error) {
      console.error("initial.error", error);
      // TODO
      // temp dont remove from browser for test..
      // removeLocalStorageToken();
    }
  }

  return false;
};
