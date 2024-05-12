/* eslint-disable react/require-default-props */

import React, { useState } from "react";
import { Button, GPlacesAutocomplete2, GoogleMapsSearch, SvgIcons } from "@tripian/react";
import Model from "@tripian/model";

interface ILocationModal {
  setShowModal: () => void;
  onChange: (coordinate: Model.Coordinate, address: string) => void;
  cityBoundary: number[];
  mapCenter: Model.Coordinate;
  currentAddress: string;
  currentCoordinate: Model.Coordinate;
  t: (value: Model.TranslationKey) => string;
}

const LocationModal: React.FC<ILocationModal> = ({ setShowModal, onChange, cityBoundary, mapCenter, currentAddress, currentCoordinate, t }) => {
  const [address, setAddress] = useState<string | undefined>(currentAddress);
  const [coordinate, setCoordinate] = useState<Model.Coordinate | undefined>(currentCoordinate);
  const [viewport, setViewport] = useState<google.maps.LatLngBounds>();

  const newBounds = new google.maps.LatLngBounds(new google.maps.LatLng(cityBoundary[0], cityBoundary[2]), new google.maps.LatLng(cityBoundary[1], cityBoundary[3]));
  const geocoder = new google.maps.Geocoder();

  const callbackGPlacesAutocomplete = (googlePlace: google.maps.places.PlaceResult) => {
    if (googlePlace.formatted_address) {
      setAddress(googlePlace.formatted_address);
    }

    if (googlePlace.geometry) {
      setCoordinate({ lat: googlePlace.geometry.location?.lat() || 1, lng: googlePlace.geometry.location?.lng() || 1 });
      setViewport(googlePlace.geometry.viewport);
    }
  };

  const googleMapOnMapClick = (coordinate: Model.Coordinate) => {
    setCoordinate(coordinate);
    geocoder.geocode({ location: coordinate }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results !== null && results.length > 0) {
          const formattedAddress = results[0]?.formatted_address;
          setAddress(formattedAddress);
        }
      } else {
        console.error("Geocode error:", status);
      }
    });
  };

  return (
    <div className="md:p-2 relative">
      <div className="flex h-full flex-col justify-center items-center pt-6 pr-6 pl-6 pb-20">
        <div className="flex justify-start flex-col w-full mb-4">
          <div className="font-semibold mb-2">{t("trips.myTrips.itinerary.customPoiModal.locationModal.addLocation.title")}</div>
          <div className="flex items-center relative gap-2 rounded-lg text-[#9ca3af]">
            <SvgIcons.Info size="20px" className="text-sm" fill="#9ca3af" />
            <span className="md:text-sm text-xs">{t("trips.myTrips.itinerary.customPoiModal.locationModal.addLocation.info")}</span>
          </div>
        </div>
        <div className="flex justify-start flex-col w-full mb-8">
          <div className="font-semibold mb-2 text-sm pl-2">{t("trips.myTrips.itinerary.customPoiModal.locationModal.addLocation.address.title")}</div>
          <div>
            <GPlacesAutocomplete2
              placeholder={t("trips.myTrips.itinerary.customPoiModal.locationModal.addLocation.address.placeholder")}
              initialText={address}
              onSelectedChanged={callbackGPlacesAutocomplete}
              boundry={newBounds}
            />
          </div>
        </div>
        <div className="flex justify-start flex-col w-full mb-6 relative h-[200px]">
          <GoogleMapsSearch zoom={14} center={mapCenter} bounds={viewport} coordinate={coordinate} onChange={googleMapOnMapClick} />
        </div>

        <div className="flex flex-row w-full items-center absolute bottom-4 justify-end gap-10 py-0 px-10">
          <Button
            className="!text-background-color"
            color="secondary"
            text={t("trips.myTrips.itinerary.customPoiModal.cancel")}
            onClick={() => {
              setShowModal();
              setCoordinate(undefined);
              setAddress(undefined);
              setViewport(undefined);
            }}
          />
          <Button
            color="primary"
            text={t("trips.myTrips.itinerary.customPoiModal.locationModal.addLocation.address.submit")}
            disabled={coordinate === undefined || address === undefined}
            onClick={() => {
              if (coordinate && address) {
                onChange(coordinate, address);
                setShowModal();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
