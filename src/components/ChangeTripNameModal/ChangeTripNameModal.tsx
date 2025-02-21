/* eslint-disable react/require-default-props */

import React, { useEffect, useState } from "react";
import { CloseIconButton2, Modal, PreLoading, Button } from "@tripian/react";
import moment from "moment";
import useTranslate from "../../hooks/useTranslate";

interface IChangeTripNameModal {
  showModal: boolean;
  setShowModal: () => void;
  loading: boolean;
  tripName: string;
  onChange: (tripName: string, tripHash?: string) => void;
  cityName?: string;
  arrivalDatetime?: string;
  departureDatetime?: string;
  tripHash?: string;
}

const ChangeTripNameModal: React.FC<IChangeTripNameModal> = ({ showModal, setShowModal, loading, tripName, onChange, cityName, arrivalDatetime, departureDatetime, tripHash }) => {
  const { t } = useTranslate();
  const [inputValue, setInputValue] = useState(tripName);

  const tripArrivalDatetimeMoment = moment(arrivalDatetime).utcOffset(0);
  const tripDepartureDatetimeMoment = moment(departureDatetime).utcOffset(0);

  useEffect(() => {
    setInputValue(tripName);
  }, [tripName]);

  return (
    <Modal
      className="!min-w-[90%] !w-[90%] bg-background-color md:!min-w-[30%] md:!w-32"
      show={showModal}
      backdropClick={() => {
        setShowModal();
      }}
      zIndex={499}
    >
      <div className="p-4">
        <div>
          <CloseIconButton2
            fill="#2B2B33"
            clicked={() => {
              setShowModal();
            }}
            rounded
          />
        </div>

        {loading ? (
          <div className="min-h-[10rem] flex items-center justify-center">
            <PreLoading size="small" />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center font-bold text-xl mr-1">{cityName}</div>
            <div className="flex items-center justify-center ml-1 text-lg mt-2">{`${tripArrivalDatetimeMoment.format("MMMM DD")}-${tripDepartureDatetimeMoment.format(
              "DD"
            )}, ${tripDepartureDatetimeMoment.format("YYYY")}`}</div>

            <hr className="h-px my-4 bg-gray-400 border-0" />

            <div className="mt-8">
              <h5 className="text-center font-bold text-lg mb-2">{t("trips.editTripName.title")}</h5>
              <div className="flex items-center justify-center">
                <input type="text" value={inputValue} className="w-full max-w-md p-2 border border-gray-300 rounded-lg" onChange={(e) => setInputValue(e.target.value)} />
              </div>
              <div className="flex items-center justify-center mt-6 my-2">
                <Button
                  color="primary"
                  text={t("trips.editTripName.submit").toUpperCase()}
                  onClick={() => onChange(inputValue, tripHash)}
                  disabled={inputValue === tripName || inputValue === ""}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChangeTripNameModal;
