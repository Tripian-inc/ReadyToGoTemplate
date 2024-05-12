import { useCallback, useState } from "react";
import useFocus from "../../../hooks/useFocus";

const useLayoutPlan = () => {
  const { focusLost } = useFocus();

  const [explorePlacesVisible, setExplorePlacesVisible] = useState<boolean>(false);
  const [favoritesVisible, setFavoritesVisible] = useState<boolean>(false);
  const [offersSearchVisible, setOffersSearchVisibleOrg] = useState<boolean>(false);
  const [offersMyVisible, setOffersMyVisibleOrg] = useState<boolean>(false);
  const [yourBookingsVisible, setYourBookingsVisible] = useState<boolean>(false);
  const [localExperiencesVisible, setLocalExperiencesVisible] = useState<boolean>(false);
  const [showTourInfoModal, setShowTourInfoModal] = useState<boolean>(false);

  // console.log("useLayoutPlan.offersSearchVisible", offersSearchVisible);

  const setOffersSearchVisible = useCallback(
    (newValue: boolean) => {
      focusLost();
      setOffersSearchVisibleOrg(newValue);
      setOffersMyVisibleOrg(false);
      setFavoritesVisible(false);
    },
    [focusLost]
  );

  const setOffersMyVisible = useCallback(
    (newValue: boolean) => {
      focusLost();
      setOffersMyVisibleOrg(newValue);
      setOffersSearchVisibleOrg(false);
      setFavoritesVisible(false);
    },
    [focusLost]
  );

  return {
    explorePlacesVisible,
    setExplorePlacesVisible,
    favoritesVisible,
    setFavoritesVisible,
    offersSearchVisible,
    setOffersSearchVisible,
    offersMyVisible,
    setOffersMyVisible,
    yourBookingsVisible,
    setYourBookingsVisible,
    localExperiencesVisible,
    setLocalExperiencesVisible,
    showTourInfoModal,
    setShowTourInfoModal,
  };
};

export default useLayoutPlan;
