import React, { useState, useMemo, useCallback } from "react";
import Model from "@tripian/model";
import { TripCard, ConfirmModalPopup, TabMenu, Button, PreLoading } from "@tripian/react";
// import { useSelector } from 'react-redux';
import moment from "moment";
// import ICombinedState from '../../redux/model/ICombinedState';
import { api } from "@tripian/core";
import { useDispatch, useSelector } from "react-redux";
import { saveNotification } from "../../redux/action/trip";
import ICombinedState from "../../redux/model/ICombinedState";
import useTrip from "../../hooks/useTrip";
import ShareTripModal from "../ShareTripModal/ShareTripModal";
import useTranslate from "../../hooks/useTranslate";
import classes from "./TripList.module.scss";

interface ITripList {
  tripReferences: Model.TripReference[];
  loadingTripReferences: boolean;
  cardClicked: (tripHash: string) => void;
  cardEditClicked: (tripHash: string) => void;
  cardDeleteClicked: (tripHash: string) => Promise<boolean>;
  tripCreateClicked: () => void;
}

const TripList: React.FC<ITripList> = ({ tripReferences, loadingTripReferences, cardClicked, cardEditClicked, cardDeleteClicked, tripCreateClicked }) => {
  const [modalState, setModalState] = useState({ show: false, tripHash: "" });
  const [isPastTrip, setIsPastTrip] = useState(false);
  const [icsLoading, setIcsLoading] = useState<{ tripHashes: string[] }>({ tripHashes: [] });

  const { t } = useTranslate();

  const { tripShare } = useTrip();
  const { shared } = useSelector((state: ICombinedState) => ({
    shared: state.trip.reference?.shared,
  }));

  const [shareModalState, setShareModalState] = useState<{ show: boolean; loading: boolean; switchChecked: boolean; tripReference?: Model.TripReference }>({
    show: false,
    loading: false,
    switchChecked: shared || false,
    tripReference: undefined,
  });

  const dispatch = useDispatch();

  const tripReferenceToShow = useMemo(() => {
    const now = moment(new Date()).format("X");
    const tripDate = (datetime: string) => moment(datetime).utcOffset(0).format("X");

    return tripReferences.filter((trip) => {
      const tripDepartureDate = tripDate(trip.tripProfile.departureDatetime);
      return isPastTrip ? tripDepartureDate < now : tripDepartureDate > now;
    });
  }, [isPastTrip, tripReferences]);

  const modalFinally = useCallback(() => {
    setModalState({ show: false, tripHash: "" });
  }, []);

  const icsFileDownload = (tripHash: string) => {
    const newIcsLoading = { ...icsLoading };
    newIcsLoading.tripHashes.push(tripHash);
    setIcsLoading(newIcsLoading);
    api
      .tripDownloadIcs(tripHash)
      .catch((err) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "planDownload", "Download Plan", err));
      })
      .finally(() => {
        const newIcsLoading = { ...icsLoading };
        const tripHashIndex = newIcsLoading.tripHashes.findIndex((t) => t === tripHash);
        newIcsLoading.tripHashes.splice(tripHashIndex, 1);
        setIcsLoading(newIcsLoading);
      });
  };

  const switchCheckedOnchange = (checked: boolean, tripHash?: string) => {
    if (tripHash) {
      setShareModalState({ ...shareModalState, loading: true });
      tripShare(tripHash, checked).finally(() => {
        setShareModalState({ ...shareModalState, switchChecked: checked, loading: false });
      });
    }
  };

  return (
    <>
      <div className="col col12" style={{ padding: "0 10%" }}>
        <TabMenu
          menuItems={[
            {
              title: t("trips.myTrips.upComingTrips.title"),
              onClick: () => {
                setIsPastTrip(false);
              },
            },
            {
              title: t("trips.myTrips.pastTrips.title"),
              onClick: () => {
                setIsPastTrip(true);
              },
            },
          ]}
          selectedIndex={0}
        />
      </div>

      {loadingTripReferences ? (
        <PreLoading customClass="py8" />
      ) : (
        <>
          <ConfirmModalPopup
            openModalPopup={modalState.show}
            text={t("trips.deleteTrip.question")}
            confirmButtonText={t("trips.deleteTrip.submit")}
            cancelButtonText={t("trips.deleteTrip.cancel")}
            action={() => cardDeleteClicked(modalState.tripHash)}
            confirmationCallback={modalFinally}
            cancelCallback={modalFinally}
            className={classes.comfirmModal}
          />

          <ShareTripModal
            showModal={shareModalState?.show}
            setShowModal={() => setShareModalState({ ...shareModalState, show: !shareModalState.show })}
            loading={shareModalState.loading}
            switchChecked={shareModalState.switchChecked}
            onChange={switchCheckedOnchange}
            cityName={shareModalState.tripReference?.city.name}
            arrivalDatetime={shareModalState.tripReference?.tripProfile.arrivalDatetime}
            departureDatetime={shareModalState.tripReference?.tripProfile.departureDatetime}
            tripHash={shareModalState.tripReference?.tripHash}
            dayIndex={0}
          />

          {tripReferenceToShow.length === 0 ? (
            <>
              <div className="col col12 mt5">{isPastTrip ? t("trips.myTrips.pastTrips.emptyMessage") : t("trips.myTrips.upComingTrips.emptyMessage")}</div>
              {!isPastTrip ? (
                <div className="col col12 mt5">
                  <Button text={t("trips.createNewTrip.header")} color="primary" onClick={tripCreateClicked} />
                </div>
              ) : null}
            </>
          ) : (
            tripReferenceToShow.map((tripReference, i) => (
              <div key={tripReference.id} className="col col12 col6-m">
                <TripCard
                  tripReference={tripReference}
                  clicked={() => cardClicked(tripReference.tripHash)}
                  editTrip={() => cardEditClicked(tripReference.tripHash)}
                  deleteTrip={(hash) => {
                    setModalState({ show: true, tripHash: hash });
                  }}
                  icsFileDownload={icsFileDownload}
                  icsLoading={icsLoading.tripHashes.some((tripHash) => tripHash === tripReference.tripHash)}
                  showShareTrip={window.tconfig.SHARED_TRIP}
                  shareTrip={(tripReference) => {
                    setShareModalState({ ...shareModalState, show: true, loading: false, tripReference, switchChecked: tripReference.shared });
                  }}
                  t={t}
                />
              </div>
            ))
          )}
        </>
      )}
    </>
  );
};

export default TripList;
