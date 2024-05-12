import { useEffect, useMemo } from "react";
import { useHistory } from "react-router";
import { LOGIN_WITH_HASH } from "../constants/ROUTER_PATH_TITLE";
import useTrip from "./useTrip";
import useUser from "./useUser";
import useAuth from "./useAuth";

const useTripHashParams = (hashParam: string) => {
  const { isLoggedIn } = useAuth();
  const { tripReferences, loadingTripReferences, userTripReferencesFetch } = useUser();
  const { tripReference, tripFetch, tripGetShared } = useTrip();

  const { hash, hashLogin, shared } = useMemo(() => {
    const params = hashParam.split("!");
    const hash = params[0];
    const hashLogin = params.length > 1 && hashParam.split("!")[1] === "l";
    const shared = params.length > 1 && hashParam.split("!")[1] === "s";
    return { hash, hashLogin, shared };
  }, [hashParam]);

  const history = useHistory();

  /**
   * Fetch for loggedIn user
   * My Trips
   */
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch my trips
      if (tripReferences === undefined && loadingTripReferences === false) {
        // console.log("Fetch for loggedIn user, My Trips");
        userTripReferencesFetch();
      }
    }
  }, [isLoggedIn, loadingTripReferences, tripReferences, userTripReferencesFetch]);

  /**
   * Fetch for loggedIn user (own trip)
   * TripReference
   */
  useEffect(() => {
    if (isLoggedIn && tripReferences && tripReference === undefined) {
      if (tripReferences.some((x) => x.tripHash === hash)) {
        // console.log("Fetch for loggedIn user (own trip)");
        tripFetch(hash);
      }
    }
  }, [hash, isLoggedIn, tripFetch, tripReference, tripReferences]);

  /**
   * Fetch for loggedIn user, get shared trip (not own trip)
   * TripReference
   */
  useEffect(() => {
    if (isLoggedIn && tripReferences && tripReference === undefined) {
      if (!tripReferences.some((x) => x.tripHash === hash) && shared) {
        // console.log("useTripHashParams: Fetch for loggedIn user, get shared trip (not own trip)");
        tripGetShared(hash);
      }
    }
  }, [hash, isLoggedIn, shared, tripReference, tripReferences, tripGetShared]);

  /**
   * Fetch for guest user, get shared trip
   * TripReference
   */
  useEffect(() => {
    if (!isLoggedIn && shared && tripReference === undefined) {
      // console.log("useTripHashParams: Fetch for guest user, get shared trip");
      tripGetShared(hash);
    }
  }, [hash, isLoggedIn, shared, tripReference, tripReferences, tripGetShared]);

  /**
   * Login with hash for guest user
   */
  useEffect(() => {
    if (!isLoggedIn && hashLogin && window.tconfig.LOGIN_WITH_HASH) {
      // console.log("useTripHashParams: Login with hash ");
      history.replace(`${LOGIN_WITH_HASH.PATH}/${hashParam}`);
    }
  }, [hashLogin, hashParam, history, isLoggedIn]);

  return {
    hash,
    hashLogin,
    shared,
    tripReference,
  };
};

export default useTripHashParams;
