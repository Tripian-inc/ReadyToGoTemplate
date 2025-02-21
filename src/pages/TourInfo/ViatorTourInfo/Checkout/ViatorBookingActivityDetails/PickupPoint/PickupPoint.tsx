import React, { useEffect, useState } from "react";
import { TextField, Dropdown, RadioButton } from "@tripian/react";
import Model, { Providers } from "@tripian/model";

interface IPickupPoint {
  locations: Providers.Viator.GroupedLocations;
  logistics: Providers.Viator.Logistics | undefined;
  selectedMode?: string;
  selectedAnswer?: { question: string; answer: string; unit?: string; travelerNum?: number };
  handleInput: (value: any, unit?: string) => void;
  t: (value: Model.TranslationKey) => string;
}

const PickupPoint: React.FC<IPickupPoint> = ({ locations, logistics, selectedMode, selectedAnswer, handleInput, t }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedPickup, setSelectedPickup] = useState("");
  const [customPickup, setCustomPickup] = useState("");
  const [pickupLocations, setPickupLocations] = useState<
    {
      key: string;
      value: string;
      label: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    setLoading(true);
    setPickupLocations([]);
    setSelectedPickup("");

    let pickupRefs: string[] | undefined = [];
    let filteredLocations: any[] = [];

    if (selectedMode === "AIR") {
      pickupRefs = logistics?.travelerPickup.locations?.filter((loc) => loc.pickupType === "AIRPORT").map((loc) => loc.location.ref);
    } else if (selectedMode === "SEA") {
      pickupRefs = logistics?.travelerPickup.locations?.filter((loc) => loc.pickupType === "PORT").map((loc) => loc.location.ref);
    } else if (selectedMode === "OTHER") {
      pickupRefs = logistics?.travelerPickup.locations?.filter((loc) => loc.pickupType === "HOTEL" || loc.pickupType === "LOCATION").map((loc) => loc.location.ref);
    } else if (selectedMode === undefined) {
      pickupRefs = logistics?.travelerPickup.locations?.filter((loc) => loc.pickupType !== "OTHER").map((loc) => loc.location.ref);
    }

    filteredLocations = locations.pickup
      .filter((loc) => pickupRefs?.includes(loc.reference))
      .map((loc) => ({
        key: loc.provider,
        value: loc.reference,
        label: `${loc.name || loc.providerReference}`,
      }));

    setTimeout(() => {
      setSelectedOption("");
      setPickupLocations(filteredLocations);
      setLoading(false);
    }, 500);
  }, [selectedMode, locations.pickup, logistics?.travelerPickup.locations]);

  const otherRefs = logistics?.travelerPickup.locations?.filter((loc) => loc.pickupType === "OTHER").map((loc) => loc.location.ref);
  const otherLocations = locations.pickup
    .filter((loc) => otherRefs?.includes(loc.reference))
    .map((loc) => ({
      key: loc.provider,
      value: loc.reference,
      label: `${loc.name || loc.providerReference}`,
    }));

  // const startLocations = locations.start
  //   .filter((loc) => otherRefs?.includes(loc.reference))
  //   .map((loc) => ({
  //     key: loc.provider,
  //     value: loc.reference,
  //     label: `${loc.name || loc.providerReference}`,
  //   }));

  useEffect(() => {
    if (selectedAnswer) {
      if (selectedAnswer.unit === "LOCATION_REFERENCE") {
        // if (startLocations.some((s) => s.value === selectedAnswer?.answer) || otherLocations.some((s) => s.value === selectedAnswer.answer)) {
        //   setSelectedOption(selectedAnswer.answer);
        // }
        if (pickupLocations.some((l) => l.value === selectedAnswer.answer)) {
          setSelectedOption("pickedUp");
          setSelectedPickup(selectedAnswer.answer);
        }
      } else {
        setSelectedOption("freeText");
        setCustomPickup(selectedAnswer.answer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pickup-point">
      <div className="flex flex-col gap-4">
        {/* Start Locations */}
        {/* {startLocations.length > 0 &&
          startLocations.map((other, i) => (
            <>
              <div>Meeting Point</div>
              <RadioButton
                style={{ display: "flex", margin: "0" }}
                key={other.value}
                text={
                  other.key === "GOOGLE" ? (
                    <span>
                      <span>
                        {t("trips.myTrips.localExperiences.tourDetails.pickup.option")} {i + 1}
                      </span>
                      <a
                        className="ml-2 text-primary-color cursor-pointer"
                        href={`https://google.com/maps/place/?q=place_id:${other.label}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ({t("trips.myTrips.localExperiences.tourDetails.pickup.showDetails")})
                      </a>
                    </span>
                  ) : (
                    other.label
                  )
                }
                checked={selectedOption === other.value}
                onChange={() => {
                  setSelectedOption(other.value);
                  handleInput(other.value, "LOCATION_REFERENCE");
                }}
              />
            </>
          ))} */}

        {/* Pickup Options */}
        {pickupLocations.length > 0 && (
          <RadioButton
            style={{ display: "flex", margin: "0" }}
            key="pickedUp"
            text={t("trips.myTrips.localExperiences.tourDetails.pickup.location")}
            checked={selectedOption === "pickedUp"}
            onChange={() => {
              setSelectedOption("pickedUp");
              handleInput(pickupLocations[0].value, "LOCATION_REFERENCE");
            }}
          />
        )}
        {selectedOption === "pickedUp" && (
          <>
            {loading ? (
              <span>{t("trips.myTrips.itinerary.offers.qrWriter.loading")}</span>
            ) : (
              <>
                {pickupLocations.filter((l) => l.key !== "GOOGLE").length > 0 && (
                  <Dropdown
                    options={pickupLocations.filter((l) => l.key !== "GOOGLE")}
                    defaultValue={selectedPickup}
                    selectChange={(value) => {
                      setSelectedPickup(value.toString());
                      handleInput(value.toString(), "LOCATION_REFERENCE");
                    }}
                  />
                )}

                {pickupLocations.filter((l) => l.key === "GOOGLE").length > 0 && (
                  <span className="pl-6">
                    {pickupLocations
                      .filter((l) => l.key === "GOOGLE")
                      .map((opt, i) => (
                        <RadioButton
                          style={{ display: "flex", margin: "0" }}
                          key={opt.value}
                          text={
                            <span>
                              <span>
                                {t("trips.myTrips.localExperiences.tourDetails.pickup.option")} {i + 1}
                              </span>
                              <a
                                className="ml-2 text-primary-color cursor-pointer"
                                href={`https://google.com/maps/place/?q=place_id:${opt.label}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                ({t("trips.myTrips.localExperiences.tourDetails.pickup.showDetails")})
                              </a>
                            </span>
                          }
                          checked={selectedPickup === opt.value}
                          onChange={() => {
                            setSelectedPickup(opt.value);
                            handleInput(opt.value, "LOCATION_REFERENCE");
                          }}
                        />
                      ))}
                  </span>
                )}
              </>
            )}
          </>
        )}

        {/* Free Text Option */}
        {logistics?.travelerPickup.allowCustomTravelerPickup && (
          <RadioButton
            style={{ display: "flex", margin: "0" }}
            key="freeText"
            text={t("trips.myTrips.localExperiences.tourDetails.pickup.freeText")}
            checked={selectedOption === "freeText"}
            onChange={() => {
              setSelectedOption("freeText");
            }}
          />
        )}
        {selectedOption === "freeText" && (
          <TextField
            key="freetext"
            name="freetext"
            placeholder={t("trips.myTrips.localExperiences.tourDetails.enterLocation")}
            value={customPickup}
            onChange={(e) => {
              setCustomPickup(e.target.value);
              handleInput(e.target.value, "FREETEXT");
            }}
          />
        )}

        {/* Other */}
        {otherLocations.length > 0 &&
          otherLocations.map((other, i) => (
            <RadioButton
              style={{ display: "flex", margin: "0" }}
              key={other.value}
              text={
                other.key === "GOOGLE" ? (
                  <span>
                    <span>
                      {t("trips.myTrips.localExperiences.tourDetails.pickup.option")} {i + 1}
                    </span>
                    <a
                      className="ml-2 text-primary-color cursor-pointer"
                      href={`https://google.com/maps/place/?q=place_id:${other.label}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ({t("trips.myTrips.localExperiences.tourDetails.pickup.showDetails")})
                    </a>
                  </span>
                ) : (
                  other.label
                )
              }
              checked={selectedOption === other.value}
              onChange={() => {
                setSelectedOption(other.value);
                handleInput(other.value, "LOCATION_REFERENCE");
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default PickupPoint;
