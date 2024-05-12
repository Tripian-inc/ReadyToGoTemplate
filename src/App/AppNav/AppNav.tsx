/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */

import React, { useState } from "react";
import Model from "@tripian/model";
import { SideNavigation, ButtonIcons, BUTTON_TYPES } from "@tripian/react";
import { useHistory } from "react-router";
import {
  LOGIN as LOGIN_PATH_TITLE,
  REGISTER as REGISTER_PATH_TITLE,
  USER_PROFILE as USER_PROFILE_PATH_TITLE,
  TRIPS as TRIPS_PATH_TITLE,
  CREATE_TRIP as CREATE_TRIP_PATH_TITLE,
  TRAVEL_COMPANIONS as TRAVEL_COMPANIONS_PATH_TITLE,
  MY_FEEDBACK,
  MY_WALLET,
  LOGIN,
  TOURS_AND_TICKETS,
} from "../../constants/ROUTER_PATH_TITLE";

import useAuth from "../../hooks/useAuth";
import useTrip from "../../hooks/useTrip";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import TripInfoHeader from "./TripInfoHeader/TripInfoHeader";
import useUser from "../../hooks/useUser";
import { removeLocalStorageToken } from "../AppWrapper/localStorages";
import useFeedBack from "../../hooks/useFeedback";
import useTranslate from "../../hooks/useTranslate";
import classes from "./AppNav.module.scss";

interface IAppNav {
  header?: string;
  tripInfoHeader?: boolean;
  tripAppMenu?: JSX.Element;
}

enum MENUITEMS {
  TRIPS = "TRIPS",
  USER = "USER",
  SUPPORT = "SUPPORT",
}

const AppNav: React.FC<IAppNav> = ({ header, tripInfoHeader = false, tripAppMenu }) => {
  const [show, setShow] = useState<boolean>(false);

  const { isLoggedIn, logout } = useAuth();
  const { user } = useUser();
  const { tripClear, tripReference } = useTrip();
  const { loadingFeedback, feedbacks, feedbackAdd } = useFeedBack();
  const history = useHistory();

  const { getLocalData, setLocalData } = useLocalStorage<"light" | "dark">("theme");
  const theme = getLocalData();

  const { t, langCode, onSelectedLangCode } = useTranslate();

  const [checked, setChecked] = useState<boolean>(theme ? theme === "dark" : window.tconfig.AVAILABLE_THEMES[0] === "dark");
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // if (!isLoggedIn) return null;
  const userFullName = `${user?.firstName || ""} ${user?.lastName || ""}`;

  // useEffect(() => {
  //   if (!loadingCities) {
  //     window.googleTranslateElementInit = () => {
  //       if (0 !== (document.getElementById("google_translate_element")?.children.length ?? -1)) {
  //         return;
  //       }
  //       new window.google.translate.TranslateElement(
  //         {
  //           pageLanguage: "en",
  //           autoDisplay: false,
  //           includedLanguages: window.tconfig.LANGUAGES.join(","),
  //           multiLanguagePage: true,
  //           layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
  //         },
  //         "google_translate_element"
  //       );
  //     };

  //     if (window.tconfig.LANGUAGES.length > 0) {
  //       const translatorElement = document.getElementsByName("translator");

  //       const alreadyExists = 0 < Array.prototype.slice.call(translatorElement).length;

  //       if (!alreadyExists) {
  //         const addScript = document.createElement("script");
  //         addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
  //         addScript.setAttribute("name", "translator");
  //         document.body.appendChild(addScript);
  //       }
  //     }
  //   }
  //   return () => {
  //     try {
  //       const translatorScripts = Array.prototype.slice.call(document.getElementsByName("translator"));
  //       translatorScripts.map((n) => n && n.remove());
  //     } catch {}
  //   };
  // }, [loadingCities]);

  // isLoggedIn
  let sideNavigationMenuItems = [
    {
      header: MENUITEMS.TRIPS,
      title: t("trips.myTrips.title"),
      onClick: () => {
        history.push(TRIPS_PATH_TITLE.PATH);
      },
    },

    {
      header: MENUITEMS.TRIPS,
      title: t("trips.createNewTrip.title"),
      onClick: () => {
        history.push(CREATE_TRIP_PATH_TITLE.PATH);
      },
    },

    {
      header: MENUITEMS.TRIPS,
      title: t("trips.toursAndTickets.title"),
      onClick: () => {
        history.push(TOURS_AND_TICKETS.PATH);
      },
    },

    {
      header: MENUITEMS.USER,
      title: t("user.myWallet.title"),
      onClick: () => {
        history.push(MY_WALLET.PATH);
      },
      hide: !window.tconfig.SHOW_VOUCHER,
    },

    {
      header: MENUITEMS.USER,
      title: t("user.travelCompanions.title"),
      onClick: () => {
        history.push(TRAVEL_COMPANIONS_PATH_TITLE.PATH);
      },
    },

    {
      header: MENUITEMS.USER,
      title: t("user.myFeedback.title"),
      onClick: () => {
        history.push(MY_FEEDBACK.PATH);
      },
    },

    {
      header: MENUITEMS.SUPPORT,
      title: t("support.termsOfUse.title"),
      onClick: () => {
        window.open(window.tconfig.TOS_URL);
      },
    },

    {
      header: MENUITEMS.SUPPORT,
      title: t("support.feedback.title"),
      onClick: () => {
        setShowFeedbackModal(true);
      },
    },

    {
      header: MENUITEMS.SUPPORT,
      title: t("support.privacyPolicy.title"),
      onClick: () => {
        window.open(window.tconfig.PP_URL);
      },
    },

    {
      header: MENUITEMS.SUPPORT,
      title: t("support.aboutTripian.title"),
      onClick: () => {
        window.open("https://www.tripian.com/");
      },
    },
  ];

  if (window.tconfig.MENU_LINKS) {
    Object.entries(window.tconfig.MENU_LINKS).forEach((record) => {
      const headerTitle = record[0] as MENUITEMS;
      const headerLinks = record[1];

      for (let i = 0; i < headerLinks.length; i++) {
        const l = headerLinks[i];
        const item = {
          header: headerTitle,
          title: l.name,
          onClick: () => {
            if (l.external_link) window.open(l.url);
            else history.push(l.url);
          },
        };
        sideNavigationMenuItems.splice(i + 2, 0, item);
      }
    });
  }

  if (!window.tconfig.LOGIN_WITH_HASH) {
    sideNavigationMenuItems.push({
      header: MENUITEMS.USER,
      title: t("user.logout"),
      onClick: () => {
        removeLocalStorageToken();
        logout();
        tripClear();
        history.push(LOGIN.PATH);
      },
    });
  }

  if (window.tconfig.SHOW_USER_PROFILE) {
    sideNavigationMenuItems.push({
      header: MENUITEMS.USER,
      title: t("user.profile"),
      onClick: () => {
        history.push(USER_PROFILE_PATH_TITLE.PATH);
      },
    });
  }

  if (isLoggedIn === false) {
    sideNavigationMenuItems = [
      {
        header: MENUITEMS.USER,
        title: t("user.login"),
        onClick: () => {
          history.push(LOGIN_PATH_TITLE.PATH);
        },
      },

      {
        header: MENUITEMS.USER,
        title: t("user.register"),
        onClick: () => {
          history.push(REGISTER_PATH_TITLE.PATH);
        },
      },

      {
        header: MENUITEMS.SUPPORT,
        title: t("support.termsOfUse.title"),
        onClick: () => {
          window.open(window.tconfig.TOS_URL);
        },
      },

      {
        header: MENUITEMS.SUPPORT,
        title: t("support.privacyPolicy.title"),
        onClick: () => {
          window.open(window.tconfig.PP_URL);
        },
      },

      {
        header: MENUITEMS.SUPPORT,
        title: t("support.aboutTripian.title"),
        onClick: () => {
          window.open("https://www.tripian.com/");
        },
      },
    ];
  }

  const pageNav = (
    <>
      {header ? <h2 className={classes.appnavPageTitle}>{header}</h2> : null}

      {tripInfoHeader ? <TripInfoHeader /> : null}

      {tripReference && tripAppMenu ? <div className={classes.appNavIconImageContainer}>{tripAppMenu}</div> : null}
    </>
  );

  const sendFeedback = (feedback: Model.FeedbackRequest) => {
    const newFeedback = { ...feedback };
    newFeedback.tripHash = tripReference?.tripHash;
    newFeedback.desc = feedback.desc.replace(/^\s+|\s+$/g, "");
    return feedbackAdd(newFeedback);
  };

  return (
    <>
      <header className={`${classes.header} ${classes.headerFake}`}>
        <div className={classes.hcontainer} />
      </header>

      <header className={`${classes.header} ${classes.fixed} ${classes.bshadow}`}>
        <div className={classes.hcontainer}>
          {window.tconfig.SHOW_SIDE_NAV && (
            <div className={`pl3 ${classes.barsIcon}`} style={{ position: "absolute" }}>
              <ButtonIcons.Bars
                type={BUTTON_TYPES.TEXT}
                onClick={() => {
                  setShow(true);
                }}
              />
            </div>
          )}
          <div className={classes.logo}>
            <div
              className={`${theme === "dark" ? classes.logoAppDark : classes.logoAppLight}  hide-s`}
              onClick={() => {
                if (window.tconfig.SHOW_SIDE_NAV) history.push(TRIPS_PATH_TITLE.PATH);
              }}
            >
              {/* {window.tconfig.BRAND_URL && window.tconfig.BRAND_URL !== "" ? (
              <a className={classes.appLogo} href={window.tconfig.BRAND_URL} target="_blank" rel="noreferrer">
                <img src={theme === "dark" ? window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK : window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT || TripianLogo} alt="logo" className="hide-s" />
              </a>
            ) : (
              <img src={theme === "dark" ? window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK : window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT || TripianLogo} alt="logo" className="hide-s" />
            )} */}
            </div>
          </div>
          {pageNav}
        </div>
      </header>
      {window.tconfig.SHOW_SIDE_NAV && (
        <SideNavigation
          title={userFullName}
          menuItems={sideNavigationMenuItems}
          open={show}
          closed={() => {
            setShow(false);
          }}
          showBbButton={window.tconfig.BRAND_NAME === "bookbarbados"}
          feedbackSubjects={feedbacks?.mainSubjects || []}
          sendFeedback={(feedback: Model.FeedbackRequest) => sendFeedback(feedback)}
          loadingFeedback={loadingFeedback}
          themeSwitchChecked={checked}
          themeSwitchCheckedOnchange={(checked: boolean) => {
            setChecked(!checked);
            checked ? setLocalData("light") : setLocalData("dark");
          }}
          showFeedbackModal={showFeedbackModal}
          setShowFeedbackModal={(show: boolean) => setShowFeedbackModal(show)}
          showThemeSwitch={window.tconfig.AVAILABLE_THEMES.length > 1}
          languageOptions={window.tconfig.T.lang_codes}
          selectedLanguage={langCode}
          onSelectedLanguage={onSelectedLangCode}
          t={t}
          // showGoogleTranslate={window.tconfig.LANGUAGES.length > 0}
        />
      )}
    </>
  );
};

export default AppNav;
