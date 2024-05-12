import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import * as ROUTER_PATH_TITLE from "../../constants/ROUTER_PATH_TITLE";
// import AppNav from '../AppNav/AppNav';

import IndexPage from "../../pages/Index/Index";
import LandingPage from "../../pages/Landing/Landing";
import RegisterPage from "../../pages/Register/Register";
import LoginPage from "../../pages/Login/Login";
import TripsPage from "../../pages/Trips/Trips";
import MyFeedback from "../../pages/MyFeedback/MyFeedback";
import TripPlanRedirect from "../../pages/TripPlanRedirect/TripPlanRedirect";
import TripPlanPage from "../../pages/TripPlan/TripPlan";
import CreateTripPage from "../../pages/CreateUpdateTrip/CreateTrip";
import UpdateTripPage from "../../pages/CreateUpdateTrip/UpdateTrip";
import TripClonePage from "../../pages/TripClone/TripClone";
import NotFoundPage from "../../pages/NotFound/NotFound";
import UserProfilePage from "../../pages/UserProfile/UserProfile";
import MyWalletPage from "../../pages/MyWallet/MyWallet";
import QrReaderPage from "../../pages/QrReader/QrReaderPage";
import OfferPaymentPage from "../../pages/OfferPayment/OfferPaymentPage";
import QrWriterPage from "../../pages/QrWriter/QrWriterPage";
import UseTripUrlPage from "../../pages/UseTripUrl/UseTripUrl";
import WidgetsPage from "../../pages/Widgets/Widgets";
import LoginWithHashPage from "../../pages/LoginWithHash/LoginWithHash";
import PlaceInfoPage from "../../pages/PlaceInfo/PlaceInfo";
import TourInfoPage from "../../pages/TourInfo/TourInfo";
import TravelCompanions from "../../pages/TravelCompanions/TravelCompanions";
import OverviewPage from "../../pages/Overview/Overview";
import ForgotPasswordPage from "../../pages/ForgotPassword/ForgotPassword";
import NewPasswordPage from "../../pages/NewPassword/NewPassword";
import SocialLoginRedirect from "../../pages/SocialLoginRedirect/SocialLoginRedirect";
import TravelGuidePage from "../../pages/TravelGuide/TravelGuide";
import LocalExperiencesPage from "../../pages/LocalExperiences/LocalExperiences";
import ToursandTicketsPage from "../../pages/ToursandTickets/ToursandTickets";
import CampaignOffersPage from "../../pages/CampaignOffers/CampaignOffersPage";
import DeleteUserPage from "../../pages/DeleteUser/DeleteUserPage";

const AppRouter = () => (
  <Router basename={window.tconfig.DOMAIN_ROUTER_BASE_NAME}>
    {/* <AppNav /> */}
    <Switch>
      <Route path={ROUTER_PATH_TITLE.INDEX.PATH} exact component={IndexPage} />
      <Route path={ROUTER_PATH_TITLE.LANDING.PATH} exact component={LandingPage} />
      <Route path={ROUTER_PATH_TITLE.REGISTER.PATH} exact component={RegisterPage} />
      <Route path={ROUTER_PATH_TITLE.LOGIN.PATH} exact component={LoginPage} />
      <Route path={ROUTER_PATH_TITLE.FORGOT_PASSWORD.PATH} exact component={ForgotPasswordPage} />
      <Route path={`${ROUTER_PATH_TITLE.NEW_PASSWORD.PATH}/:hash`} exact component={NewPasswordPage} />
      <Route path={`${ROUTER_PATH_TITLE.WIDGETS.PATH}/:widgetName`} exact component={WidgetsPage} />

      <Route path={`${ROUTER_PATH_TITLE.LOGIN_WITH_HASH.PATH}/:hashParam`} exact component={LoginWithHashPage} />
      <PrivateRoute path={ROUTER_PATH_TITLE.MY_FEEDBACK.PATH} exact component={MyFeedback} />
      <PrivateRoute path={ROUTER_PATH_TITLE.USER_PROFILE.PATH} exact component={UserProfilePage} />
      <PrivateRoute path={ROUTER_PATH_TITLE.MY_WALLET.PATH} exact component={MyWalletPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.CAMPAIGN_OFFERS.PATH}/:campaignId`} exact component={CampaignOffersPage} />
      <PrivateRoute path={ROUTER_PATH_TITLE.QR_READER.PATH} exact component={QrReaderPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.OFFER_PAYMENT.PATH}/:offerId`} exact component={OfferPaymentPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.QR_WRITER.PATH}/:offerId`} exact component={QrWriterPage} />

      <PrivateRoute path={ROUTER_PATH_TITLE.TRIPS.PATH} exact component={TripsPage} />
      <PrivateRoute path={ROUTER_PATH_TITLE.CREATE_TRIP.PATH} exact component={CreateTripPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.UPDATE_TRIP.PATH}/:hashParam`} exact component={UpdateTripPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.TRIP_CLONE.PATH}/:hashParam`} exact component={TripClonePage} />
      <Route path={`${ROUTER_PATH_TITLE.TRIP_PLAN.PATH}/:hashParam`} exact component={TripPlanRedirect} />
      <Route path={`${ROUTER_PATH_TITLE.TRIP_PLAN.PATH}/:hashParam/:dayIndex`} exact component={TripPlanPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.TRAVEL_GUIDE.PATH}/:hash`} exact component={TravelGuidePage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.OVERVIEW.PATH}/:hash`} exact component={OverviewPage} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.TRAVEL_COMPANIONS.PATH}`} exact component={TravelCompanions} />
      <PrivateRoute path={`${ROUTER_PATH_TITLE.DELETE_USER.PATH}`} exact component={DeleteUserPage} />

      <Route path={`${ROUTER_PATH_TITLE.PLACE_INFO.PATH}/:id`} component={PlaceInfoPage} />
      <Route path={`${ROUTER_PATH_TITLE.TOUR_INFO.PATH}/:providerId/:id`} component={TourInfoPage} />
      <Route path={ROUTER_PATH_TITLE.LOCAL_EXPERIENCES.PATH} component={LocalExperiencesPage} />
      <Route path={ROUTER_PATH_TITLE.TOURS_AND_TICKETS.PATH} component={ToursandTicketsPage} />
      <Route path={ROUTER_PATH_TITLE.USE_TRIP_URL.PATH} component={UseTripUrlPage} />
      <Route path={`${ROUTER_PATH_TITLE.SOCIAL_LOGIN_REDIRECT.PATH}`} component={SocialLoginRedirect} />
      <Route path={ROUTER_PATH_TITLE.NOT_FOUND.PATH} component={NotFoundPage} />
    </Switch>
  </Router>
);

export default AppRouter;
