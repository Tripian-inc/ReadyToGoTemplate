/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { LANDING, LOGIN, REGISTER, TRIPS } from "../../constants/ROUTER_PATH_TITLE";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation, EffectFlip, Swiper as SwiperClass } from "swiper";
import moment from "moment";
import { SvgIcons } from "@tripian/react";
import { useHistory } from "react-router";
import { useNumberCounter } from "./useNumberCounter";
import { useWhenVisible } from "./useWhenVisible";
import TripianLogo from "../../assets/img/tripian-new-icon.png";
import features1 from "./img/elements/features/1.png";
import features2 from "./img/elements/features/2.png";
import features5 from "./img/elements/features/5.png";
import features4 from "./img/elements/features/4.png";
import darkTripianLogo from "../../assets/img/dark-tripian.png";
import lightTripianLogo from "../../assets/img/light-tripian.png";
import quotes from "./img/icons/png/quotes.png";
import howit from "./img/elements/howit.png";
import createAccount from "./img/elements/how-works/createAccount.png";
import setUpTrip from "./img/elements/how-works/setUpTrip.png";
import readyToGo from "./img/elements/how-works/readyToGo.png";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useSelector } from "react-redux";
import ICombinedState from "../../redux/model/ICombinedState";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import useTranslate from "../../hooks/useTranslate";
import classes from "./Landing.module.scss";

const counterSecond = 2;
const counterTimes = 20;

const Landing = () => {
  const [listItemIndex, setListItemIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperClass>();

  const { t } = useTranslate();

  const { count: countriesCount, runCounter: runCountriesCounter } = useNumberCounter(62, counterSecond, counterTimes);
  const { count: citiesCount, runCounter: runCitiesCounter } = useNumberCounter(250, counterSecond, counterTimes);
  const { refDom } = useWhenVisible(() => {
    runCountriesCounter();
    runCitiesCounter();
  });

  const isLoggedIn = useSelector((state: ICombinedState) => state.user.isLoggedIn);

  const { getLocalData } = useLocalStorage<"light" | "dark">("theme");
  const theme = getLocalData();

  const history = useHistory();

  document.title = LANDING.TITLE(t("welcome"));

  const landingListItemSelected = (index: number) => {
    setListItemIndex(index);
    if (swiper) swiper.slideTo(index);
  };

  const onClickLogin = () => {
    if (isLoggedIn) {
      history.push(TRIPS.PATH);
    } else {
      history.push(LOGIN.PATH);
    }
  };

  const onClickRegister = () => {
    if (isLoggedIn) {
      history.push(TRIPS.PATH);
    } else {
      if (window.tconfig.SHOW_REGISTER) {
        history.push(REGISTER.PATH);
      } else {
        onClickLogin();
      }
    }
  };

  return (
    <>
      {window.tconfig.LANDING_PAGE_URL ? (
        <iframe className={classes.iframe} src={window.tconfig.LANDING_PAGE_URL} title={window.tconfig.BRAND_NAME}></iframe>
      ) : (
        <div className={classes.landing}>
          <header className={classes.landingHeader}>
            <nav className={classes.landingHeaderNav}>
              <div className={classes.landingBanner}>
                <a title="Tripian">
                  <img
                    className={classes.landingHeaderTripianLogo}
                    src={theme === "dark" ? window.tconfig.IMAGE_PATHS.LOGO_PATH_DARK : window.tconfig.IMAGE_PATHS.LOGO_PATH_LIGHT || TripianLogo}
                    alt="Tripian"
                  />
                </a>

                {window.tconfig.BRAND_NAME !== "Tripian" && (
                  <div className={classes.landingBannerLogo}>
                    <div className={classes.landingBannerLogoText}>{t("landing.poweredBy")}</div>
                    <img className={classes.landingBannerLogoImg} src={theme === "dark" ? darkTripianLogo : lightTripianLogo || TripianLogo} alt="tripian" />
                  </div>
                )}
              </div>

              <ul className={classes.landingHeaderMenu}>
                {(window.tconfig.SHOW_REGISTER || isLoggedIn) && (
                  <li>
                    <a className={classes.active} onClick={onClickRegister}>
                      {t("landing.getStarted")}
                    </a>
                  </li>
                )}
                {!isLoggedIn && (
                  <li>
                    <a onClick={onClickLogin}>{t("landing.login")}</a>
                  </li>
                )}
              </ul>
            </nav>
          </header>

          <main className={classes.landingMain}>
            <div className={classes.landingCover}>
              <div className={classes.landingRowFluid}>
                <div className={classes.landingActionsArea}>
                  <h1 className={classes.landingCoverTitle}>{t("landing.title")}</h1>
                  <p className={classes.landingCoverDesc}>{t("landing.description")}</p>
                  <div className={classes.landingActionButtons}>
                    <a onClick={onClickRegister}>{t("landing.getStarted")}</a>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${classes.margin50v} ${classes.padding50v}`}>
              <div>
                <div className={classes.inner}>
                  <div className={classes.landingHead}>
                    <span className={classes.landingTitle}>
                      {t("landing.feelLikeALocalWhereverYouGo.title")}
                      <span className={classes.tm}>&#8482;</span>
                    </span>
                  </div>
                  <div className={classes.landingSwipers}>
                    <div className={`row ${classes.dLgFlex}`}>
                      <div className="col col12 col6-m hide-s">
                        <div className={classes.swiperContainer}>
                          <div className={classes.landingSwiperWrapper}>
                            <Swiper onSwiper={setSwiper} grabCursor={true} effect={"flip"} modules={[EffectFlip]} className="mySwiper">
                              <SwiperSlide virtualIndex={0}>
                                <img src={features1} alt="Personalized" />
                              </SwiperSlide>
                              <SwiperSlide virtualIndex={1}>
                                <img src={features2} alt="Mapped" />
                              </SwiperSlide>
                              <SwiperSlide virtualIndex={2}>
                                <img src={features5} alt="No More" />
                              </SwiperSlide>
                              <SwiperSlide virtualIndex={3}>
                                <img src={features4} alt="Access Anywhere" />
                              </SwiperSlide>
                            </Swiper>
                          </div>
                        </div>
                      </div>
                      <div className="col col12 col6-m">
                        <div className={classes.landingFeelLikeListSwiper}>
                          <div className={classes.landingSwiperWrapper}>
                            <div className={`${classes.landingSwiperSlide} ${classes.active}`}>
                              <div
                                className={listItemIndex === 0 ? `${classes.landingListItem} ${classes.landingListItemSelected}` : classes.landingListItem}
                                swipe-to="0"
                                onClick={() => {
                                  landingListItemSelected(0);
                                }}
                              >
                                <div className={classes.landingIconCap}>
                                  <div className={classes.landingIcon}>
                                    <SvgIcons.LandingProfile fill={listItemIndex === 0 ? "#fff" : "#2e94f7"} />
                                  </div>
                                </div>
                                <div className={classes.landingBody}>
                                  <span className={classes.landingBodyTitle}>{t("landing.feelLikeALocalWhereverYouGo.personalizedRecommendations.title")}</span>
                                  <p className={classes.landingBodyDesc}>{t("landing.feelLikeALocalWhereverYouGo.personalizedRecommendations.description")}</p>
                                </div>
                              </div>
                            </div>
                            <div className={classes.landingSwiperSlide}>
                              <div
                                className={listItemIndex === 1 ? `${classes.landingListItem} ${classes.landingListItemSelected}` : classes.landingListItem}
                                swipe-to="1"
                                onClick={() => {
                                  landingListItemSelected(1);
                                }}
                              >
                                <div className={classes.landingIconCap}>
                                  <div className={classes.landingIcon}>
                                    <SvgIcons.LandingCalendar fill={listItemIndex === 1 ? "#fff" : "#2e94f7"} />
                                  </div>
                                </div>
                                <div className={classes.landingBody}>
                                  <span className={classes.landingBodyTitle}>{t("landing.feelLikeALocalWhereverYouGo.mappedOutDailyItineraries.title")}</span>
                                  <p className={classes.landingBodyDesc}>{t("landing.feelLikeALocalWhereverYouGo.mappedOutDailyItineraries.description")}</p>
                                </div>
                              </div>
                            </div>
                            <div className={classes.landingSwiperSlide}>
                              <div
                                className={listItemIndex === 2 ? `${classes.landingListItem} ${classes.landingListItemSelected}` : classes.landingListItem}
                                swipe-to="2"
                                onClick={() => {
                                  landingListItemSelected(2);
                                }}
                              >
                                <div className={classes.landingIconCap}>
                                  <div className={classes.landingIcon}>
                                    <SvgIcons.LandingThumbsUp fill={listItemIndex === 2 ? "#fff" : "#2e94f7"} />
                                  </div>
                                </div>
                                <div className={classes.landingBody}>
                                  <span className={classes.landingBodyTitle}>{t("landing.feelLikeALocalWhereverYouGo.bestPlacesFeatures.title")}</span>
                                  <p className={classes.landingBodyDesc}>{t("landing.feelLikeALocalWhereverYouGo.bestPlacesFeatures.description")}</p>
                                </div>
                              </div>
                            </div>
                            <div className={classes.landingSwiperSlide}>
                              <div
                                className={listItemIndex === 3 ? `${classes.landingListItem} ${classes.landingListItemSelected}` : classes.landingListItem}
                                swipe-to="3"
                                onClick={() => {
                                  landingListItemSelected(3);
                                }}
                              >
                                <div className={classes.landingIconCap}>
                                  <div className={classes.landingIcon}>
                                    <SvgIcons.LandingCellPhone fill={listItemIndex === 3 ? "#fff" : "#2e94f7"} />
                                  </div>
                                </div>
                                <div className={classes.landingBody}>
                                  <span className={classes.landingBodyTitle}>{t("landing.feelLikeALocalWhereverYouGo.accessAnywhereAnytime.title")}</span>
                                  <p className={classes.landingBodyDesc}>{t("landing.feelLikeALocalWhereverYouGo.accessAnywhereAnytime.description")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${classes.landingTripianStatistics} ${classes.padding50v}`}>
              <div className={classes.inner}>
                <div className={`${classes.landingGrids} row`}>
                  <div className={`col col12 col4-m center ${classes.landingTripianStatisticsPadding}`}>
                    <h5 className={classes.landingStatisticsDesc}>{t("landing.weHaveGotYouCoveredIn.title")}</h5>
                  </div>
                  <div className="col col12 col8-m">
                    <div ref={refDom} className={classes.landingStatisticsCap}>
                      <div className={classes.landingStatistics}>
                        <div className={classes.landingStatisticGrid}>
                          <div className={classes.inner}>
                            <span className={classes.landingNumber} data-min="1" data-max="62" data-delay="5" data-increment="4">
                              {countriesCount}
                            </span>
                            <span className={classes.landingDesc}>{t("landing.weHaveGotYouCoveredIn.countries")}</span>
                          </div>
                        </div>
                        <div className={classes.landingStatisticGrid}>
                          <div className={classes.inner}>
                            <strong className={classes.landingNumber}>
                              <span data-min="1" data-max="250" data-delay="5" data-increment="4">
                                {citiesCount}
                              </span>
                              <strong>+</strong>
                            </strong>
                            <span className={classes.landingDesc}>{t("landing.weHaveGotYouCoveredIn.cities")}</span>
                          </div>
                        </div>
                        <div className={classes.landingStatisticGrid}>
                          <div className={`${classes.inner} ${classes.landingLastItem}`}>
                            <span className={classes.landingNumber}>
                              1<strong>M</strong>
                            </span>
                            <span className={classes.landingDesc}>{t("landing.weHaveGotYouCoveredIn.handPickedLocations")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={classes.padding50v}>
              <div className="center">
                <span className={classes.customerMessagesTitle}>{t("landing.whatTravelersAreSaying.title")}</span>
              </div>
            </div>
            <div className={classes.customerMessages}>
              <div className={`${classes.inner} ${classes.landingSwiperContainer}`}>
                <div>
                  <img src={quotes} alt="Testimonials" width="70" draggable="false" />
                </div>
                <Swiper
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  spaceBetween={30}
                  modules={[Pagination, Autoplay, Navigation]}
                  className="mySwiper"
                  style={{ width: "100%", height: "100%", padding: "2rem 0" }}
                >
                  <SwiperSlide>
                    <div className={classes.swiperSlide}>
                      <blockquote className={classes.customerMessage}>{t("landing.whatTravelersAreSaying.traveler1.message")}</blockquote>
                      <span className={classes.whoCustomer}>{t("landing.whatTravelersAreSaying.traveler1.customer")}</span>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className={classes.swiperSlide}>
                      <blockquote className={classes.customerMessage}>{t("landing.whatTravelersAreSaying.traveler2.message")}</blockquote>
                      <span className={classes.whoCustomer}>{t("landing.whatTravelersAreSaying.traveler2.customer")}</span>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className={classes.swiperSlide}>
                      <blockquote className={classes.customerMessage}>{t("landing.whatTravelersAreSaying.traveler3.message")}</blockquote>
                      <span className={classes.whoCustomer}>{t("landing.whatTravelersAreSaying.traveler3.customer")}</span>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>

            <div className={`${classes.margin50v} ${classes.padding50v}`}>
              <div className={classes.howTripianWorks}>
                <div className={classes.landingHead}>
                  <div className={classes.landingTitle}>{t("landing.howTripianWorks.title")}</div>
                </div>
                <div className={classes.inner}>
                  <div className={classes.landingVaweCap}>
                    <img src={howit} alt="How Tripian Works" />
                  </div>
                  <div className={`row ${classes.landingGrids}`} style={{ overflow: "hidden" }}>
                    <div className={`col col12 col4-m ${classes.howWorkGrid}`}>
                      <div className={`col col12 ${classes.inner}`}>
                        <div className={classes.landingImageCap}>
                          <img className={classes.landingOfContain} src={createAccount} alt="createAccount" />
                        </div>
                        <div className={classes.landingInfo}>
                          <span className={classes.title}>{t("landing.howTripianWorks.createYourAccount.title")}</span>
                          <p className={classes.desc}>{t("landing.howTripianWorks.createYourAccount.description")}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`col col12 col4-m ${classes.howWorkGrid}`}>
                      <div className={`col col12 ${classes.inner}`}>
                        <div className={classes.landingImageCap}>
                          <img className={classes.landingOfContain} src={setUpTrip} alt="setUpTrip" />
                        </div>
                        <div className={classes.landingInfo}>
                          <span className={classes.title}>{t("landing.howTripianWorks.setUpYourTrip.title")}</span>
                          <p className={classes.desc}>{t("landing.howTripianWorks.setUpYourTrip.description")}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`col col12 col4-m ${classes.howWorkGrid}`}>
                      <div className={`col col12 ${classes.inner}`}>
                        <div className={classes.landingImageCap}>
                          <img className={classes.landingOfContain} src={readyToGo} alt="readyToGo" />
                        </div>
                        <div className={classes.landingInfo}>
                          <span className={classes.title}>{t("landing.howTripianWorks.readyToGo.title")}</span>
                          <p className={classes.descLast}>{t("landing.howTripianWorks.readyToGo.description")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${classes.landingReadyToGet} py12`}>
              <div className={classes.title}>{t("landing.readyToGetStarted")}</div>
              <a onClick={onClickRegister}>{t("landing.planYourTripNow")}</a>
            </div>

            <footer className={classes.landingFooter}>
              <div className="row">
                <div className="col col12 col4-m center pt6">
                  <a href="https://www.tripian.com/about.html" target="_blank">
                    {t("landing.aboutTripian")}
                  </a>
                </div>
                <div className="col col12 col4-m center pt6">
                  <a href="https://www.tripian.com/docs/l/tos_t.html" target="_blank">
                    {t("landing.termsOfUse")}
                  </a>
                </div>
                <div className="col col12 col4-m center pt6">
                  <a href="https://www.tripian.com/docs/l/pp_t.html" target="_blank">
                    {t("landing.privacyPolicy")}
                  </a>
                </div>
                <div className="col col12 col12-m center pt6">
                  <span className={classes.footerText}>
                    © {moment().format("YYYY")} {t("landing.allRightsReserved")}
                  </span>
                </div>
              </div>
            </footer>
          </main>
        </div>
      )}
    </>
  );
};

export default Landing;

/* <div className="preloader">
        <img src={pin} alt="Tripian" />
      </div> */
