/* eslint-disable react/require-default-props */

import React, { useMemo, useState } from "react";
import { Button, Dropdown, Input, Modal, RadioButton, SvgIcons } from "@tripian/react";
import Model, { helper } from "@tripian/model";
import moment from "moment";
import LocationModal from "./Location/Location";
import useStep from "../../hooks/useStep";
import useTrip from "../../hooks/useTrip";
import usePlan from "../../hooks/usePlan";
import useTranslate from "../../hooks/useTranslate";

type CustomStep = {
  customPoi: Model.CustomPoi;
  stepType: string;
  startTime: string;
  endTime: string;
};

interface ICustomPoiModal {
  planDayIndex: number;
  showModal: boolean;
  setShowModal: () => void;
}

const initialData: CustomStep = {
  customPoi: {
    name: "",
    coordinate: { lat: 1, lng: 1 },
    address: "",
    description: undefined,
  },
  stepType: "poi",
  startTime: moment(new Date()).set({ hour: 9, minute: 0 }).format("HH:mm"),
  endTime: moment(new Date()).set({ hour: 9, minute: 30 }).format("HH:mm"),
};

const CustomPoiModal: React.FC<ICustomPoiModal> = ({ planDayIndex, showModal, setShowModal }) => {
  const [error, setError] = useState(undefined);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [data, setData] = useState<CustomStep>(initialData);

  const { customStepAdd } = useStep();

  const { tripReference } = useTrip();
  const { plans } = usePlan();
  const { t } = useTranslate();

  const plan = useMemo(() => (plans ? plans[planDayIndex] : undefined), [planDayIndex, plans]);

  const [options, setOptions] = useState<Array<{ text: string; value: string; checked: boolean }>>([
    { text: t("trips.myTrips.itinerary.customPoiModal.stepDetails.poi"), value: "poi", checked: true },
    { text: t("trips.myTrips.itinerary.customPoiModal.stepDetails.event"), value: "event", checked: false },
  ]);

  const startTimeOptions = useMemo(() => {
    const startTimes = helper.startTimeRange().map((time: string) => ({
      key: undefined,
      value: time,
    }));

    return startTimes;
  }, []);

  const endTimeOptions = useMemo(() => {
    return helper.endTimeRange(data.startTime).map((time: string) => ({
      key: undefined,
      value: time,
    }));
  }, [data?.startTime]);

  const callbackStartTime = (startTime: string | number) => {
    const newData: CustomStep = helper.deepCopy(data);

    const start = moment()
      .set({ hour: +startTime.toString().slice(0, 2), minute: +startTime.toString().slice(3, 5) })
      .format("HH:mm");

    const end = moment(start, "HH:mm").add(30, "minutes").format("HH:mm");

    newData.startTime = start;
    newData.endTime = end;
    setData(newData);
  };

  const callbackEndTime = (endTime: string | number) => {
    const newData: CustomStep = helper.deepCopy(data);

    const end = moment()
      .set({ hour: +endTime.toString().slice(0, 2), minute: +endTime.toString().slice(3, 5) })
      .format("HH:mm");

    newData.endTime = end;
    setData(newData);
  };

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData: CustomStep = helper.deepCopy(data);
    newData.customPoi.name = event.target.value;
    setData(newData);
  };

  const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData: CustomStep = helper.deepCopy(data);
    newData.customPoi.description = event.target.value;
    setData(newData);
  };

  const handleChangeLocation = (coordinate: Model.Coordinate, address: string) => {
    const newData: CustomStep = helper.deepCopy(data);
    newData.customPoi.coordinate = coordinate;
    newData.customPoi.address = address;
    setData(newData);
  };

  const handleChangeStepType = (type: string) => {
    const newData: CustomStep = helper.deepCopy(data);
    newData.stepType = type;
    setData(newData);
  };

  const disabled = useMemo(() => {
    if (
      data.customPoi.address === undefined ||
      data.customPoi.address === "" ||
      data.customPoi.coordinate === undefined ||
      data.customPoi.address === undefined ||
      data.customPoi.address === "" ||
      data.customPoi.name === undefined ||
      data.customPoi.name === "" ||
      data.startTime === undefined ||
      data.startTime === "" ||
      data.endTime === undefined ||
      data.endTime === "" ||
      data.stepType === undefined ||
      data.stepType === ""
    ) {
      return true;
    } else {
      return false;
    }
  }, [data.customPoi.address, data.customPoi.coordinate, data.customPoi.name, data.endTime, data.startTime, data.stepType]);

  const handleSubmit = () => {
    setError(undefined);
    if (plan)
      customStepAdd(plan.id, data.customPoi, data.stepType, data.startTime, data.endTime)
        .then(() => {
          setData(initialData);
          setShowModal();
        })
        .catch((err) => {
          setError(err);
        });
  };

  const isLocationSelected = useMemo(() => {
    return data.customPoi.coordinate.lat === 1 && data.customPoi.coordinate.lng === 1;
  }, [data.customPoi.coordinate.lat, data.customPoi.coordinate.lng]);

  return (
    <Modal
      className="!max-h-full !min-w-[90%] !w-[90%] bg-background-color md:!min-w-[40%] md:!w-40 !z-[1501]"
      show={showModal}
      backdropClick={() => {
        setShowModal();
        setShowLocationModal(false);
        setData(initialData);
        setError(undefined);
      }}
      zIndex={1500}
    >
      <div className="p-2 relative">
        {tripReference && showLocationModal ? (
          <LocationModal
            setShowModal={() => setShowLocationModal(!showLocationModal)}
            onChange={handleChangeLocation}
            cityBoundary={tripReference?.city.boundary}
            mapCenter={tripReference?.city.coordinate}
            currentAddress={data.customPoi.address}
            currentCoordinate={data.customPoi.coordinate}
            t={t}
          />
        ) : (
          <div className="flex h-full flex-col justify-center items-center pt-6 pr-6 pl-6 pb-20">
            <div className="flex justify-start flex-col w-full md:mb-6 mb-4">
              <div className="flex items-center gap-4 mb-2">
                {data.customPoi.address !== "" ? (
                  <div className="flex items-center gap-4 justify-center w-full">
                    <div>
                      <SvgIcons.AddLocation size="36px" />
                    </div>
                    <div className="font-semibold leading-8 pt-1">{data.customPoi.address}</div>
                    <div onClick={() => setShowLocationModal(true)} role="button" tabIndex={0}>
                      <SvgIcons.Edit fill="var(--primary-color)" size="1.125rem" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center mb-4 gap-4 text-2xl underline w-full" onClick={() => setShowLocationModal(true)} role="button" tabIndex={0}>
                    <div>
                      <SvgIcons.AddLocation size="36px" />
                    </div>
                    <div className="font-semibold">{t("trips.myTrips.itinerary.customPoiModal.addAddressButton")}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center relative gap-2 rounded-lg text-[#9ca3af]">
                <SvgIcons.Info size="20px" className="text-sm" fill="#9ca3af" />
                <span className="md:text-sm text-xs ">{t("trips.myTrips.itinerary.customPoiModal.addAddressInfo")}</span>
              </div>
            </div>
            <div className="flex justify-start flex-col w-full mb-4">
              <div className="font-semibold">{t("trips.myTrips.itinerary.customPoiModal.stepDetails.title")}</div>
              <div className="flex items-center ml-[-0.75rem] capitalize gap-4">
                {options.map((option, index) => (
                  <RadioButton
                    style={{ display: "flex", margin: "0" }}
                    key={option.text}
                    text={option.text}
                    checked={option.checked}
                    onChange={() => {
                      const newOptions = [...options];
                      if (index === 0) {
                        newOptions[0].checked = true;
                        newOptions[1].checked = false;
                      } else {
                        newOptions[1].checked = true;
                        newOptions[0].checked = false;
                      }
                      setOptions(newOptions);

                      const selectedOption = newOptions.find((o) => o.checked === true);
                      if (selectedOption) handleChangeStepType(selectedOption.value);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-start flex-col w-full md:mb-6 mb-4">
              <div className="font-semibold mb-2">
                {data.stepType === "poi" ? t("trips.myTrips.itinerary.customPoiModal.stepDetails.poi") : t("trips.myTrips.itinerary.customPoiModal.stepDetails.event")}{" "}
                {t("trips.myTrips.itinerary.customPoiModal.name.title")}
              </div>
              <div>
                <Input
                  type="text"
                  placeholder={t("trips.myTrips.itinerary.customPoiModal.name.placeholder")}
                  name="custompoi"
                  value={data.customPoi.name}
                  onChange={handleChangeName}
                  disabled={isLocationSelected}
                />
              </div>
            </div>
            <div className="flex justify-start flex-col w-full md:mb-6 mb-4">
              <div className="font-semibold mb-2">{t("trips.myTrips.itinerary.customPoiModal.description.title")}</div>
              <div>
                <Input
                  type="text"
                  placeholder={t("trips.myTrips.itinerary.customPoiModal.description.placeholder")}
                  name="description"
                  value={data.customPoi.description || ""}
                  onChange={handleChangeDescription}
                  disabled={isLocationSelected}
                />
              </div>
            </div>

            <div className="flex justify-start flex-col w-full mb-2">
              <div className="font-semibold mb-3">{t("trips.myTrips.itinerary.customPoiModal.visitTime.title")}</div>
              <div className="flex items-center gap-12">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div>{t("trips.myTrips.itinerary.customPoiModal.visitTime.from")}</div>
                  <div>
                    <Dropdown
                      options={startTimeOptions}
                      // defaultValue={`${moment().utcOffset(0).format("HH")}:${moment().utcOffset(0).format("mm")}`}
                      defaultValue={data.startTime}
                      selectChange={callbackStartTime}
                      disabled={isLocationSelected}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div>{t("trips.myTrips.itinerary.customPoiModal.visitTime.to")}</div>
                  <div>
                    <Dropdown
                      options={endTimeOptions}
                      // defaultValue={`${moment().utcOffset(0).format("HH")}:${moment().utcOffset(0).format("mm")}`}
                      defaultValue={data.endTime}
                      selectChange={callbackEndTime}
                      disabled={isLocationSelected}
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr />
            {error && <div className="text-primary-color text-center my-2">{error}</div>}
            <div className="flex flex-row w-full items-center absolute bottom-4 justify-center gap-10 py-0  lg:px-20 px-12">
              <Button
                className="!text-background-color !min-w-[50%]"
                color="secondary"
                text={t("trips.myTrips.itinerary.customPoiModal.cancel")}
                onClick={() => {
                  setShowModal();
                  setData(initialData);
                  setError(undefined);
                }}
              />
              <Button className="!min-w-[50%]" color="primary" text={t("trips.myTrips.itinerary.customPoiModal.submit")} disabled={disabled} onClick={handleSubmit} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomPoiModal;
