/* eslint-disable react/require-default-props */

import React, { useState } from "react";
import { Button, CloseIconButton2, Modal, PreLoading, SvgIcons } from "@tripian/react";
import moment from "moment";
import useTranslate from "../../hooks/useTranslate";
interface IShareTripModal {
  showModal: boolean;
  setShowModal: () => void;
  loading: boolean;
  switchChecked: boolean;
  onChange: (checked: boolean, tripHash?: string) => void;
  cityName?: string;
  arrivalDatetime?: string;
  departureDatetime?: string;
  tripHash?: string;
  dayIndex: number;
}

const ShareTripModal: React.FC<IShareTripModal> = ({
  showModal,
  setShowModal,
  loading,
  switchChecked,
  onChange,
  cityName,
  arrivalDatetime,
  departureDatetime,
  tripHash,
  dayIndex,
}) => {
  const [copySuccess, setCopySuccess] = useState("");

  const { t } = useTranslate();

  const tripUrl = `${window.location.origin}/trip/${tripHash}!s/${dayIndex}`;

  const copyToClipBoard = async (copyMe: string) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess("Copied!");
      setTimeout(() => {
        setCopySuccess("");
      }, 1000);
    } catch (err) {
      setCopySuccess("Failed!");
    }
  };

  const tripArrivalDatetimeMoment = moment(arrivalDatetime).utcOffset(0);
  const tripDepartureDatetimeMoment = moment(departureDatetime).utcOffset(0);

  return (
    <Modal
      className="!min-w-[90%] !w-[90%] bg-background-color md:!min-w-[40%] md:!w-40"
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
            <div className="flex items-center justify-center ml-1 text-lg">{`${tripArrivalDatetimeMoment.format("MMMM DD")}-${tripDepartureDatetimeMoment.format(
              "DD"
            )}, ${tripDepartureDatetimeMoment.format("YYYY")}`}</div>

            <hr className="h-px my-4 bg-gray-400 border-0" />

            <div className="flex items-center justify-center my-8">
              <h5 className="text-center font-bold text-lg mr-1">{t("trips.shareTrip.checkbox")}</h5>

              <label className="relative inline-flex items-center mr-5 cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={switchChecked}
                  className="sr-only peer"
                  onChange={(e) => {
                    onChange(e.target.checked, tripHash);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-500 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
            {switchChecked && (
              <div>
                <div className="border border-solid border-gray-400 rounded-xl flex items-center justify-between w-full p-2">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    <SvgIcons.Link size="1rem" className="mr-2" />
                    <span>{tripUrl}</span>
                  </div>
                  <Button
                    color="primary"
                    className="rounded-3xl h-10 min-w-fit"
                    onClick={() => copyToClipBoard(tripUrl)}
                    text={copySuccess ? `${t("trips.shareTrip.copiedLink")}` : `${t("trips.shareTrip.copyLink")}`}
                  />
                </div>
                <div className="flex items-center justify-center my-2 text-sm">
                  <div className="text-lg pt-1 mr-1">*</div>
                  <div>{t("trips.shareTrip.description")}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareTripModal;
