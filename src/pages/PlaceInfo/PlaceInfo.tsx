import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@tripian/core";
import Model, { helper } from "@tripian/model";
import { Button, Copy, GoogleMapsPoiInfo, OpenedHours, PageLoading, PoiInfoImage, Price, RatingStars, ReadMoreLess, ShowMoreLess } from "@tripian/react";
import { PLACE_INFO } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";
import AppNav from "../../App/AppNav/AppNav";
import TourAndTickets from "./TourAndTickets/TourAndTickets";

const PlaceInfo = () => {
  const [poiInfo, setPoiInfo] = useState<Model.Poi>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { t } = useTranslate();

  const { id } = useParams<{ id: string }>();

  document.title = PLACE_INFO.TITLE(t("placeInfo.header"));

  useEffect(() => {
    let unmonted = false;

    api
      .poi(id)
      .then((poiInfoResponse) => {
        if (!unmonted) setPoiInfo(poiInfoResponse);
      })
      .catch((err) => {
        setErrorMessage(err);
      })
      .then(() => {
        setLoading(false);
      });

    return () => {
      unmonted = true;
    };
  }, [id]);

  const openTableProduct = poiInfo?.bookings.find((b) => b.providerId === Model.PROVIDER_ID.OPEN_TABLE)?.products[0];

  /**
   * Cuisines
   */
  const cuisinesArray = poiInfo?.cuisines?.split(", ") || [];
  const uniqueCuisines: string[] = helper.removeDuplicateValues(cuisinesArray, (s1, s2) => s1 === s2);
  const poiCuisines =
    uniqueCuisines.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        <ShowMoreLess defaultItemCount={3} items={uniqueCuisines} t={t} />
      </div>
    ) : null;

  /**
   * Features
   */
  const poiFeatures =
    poiInfo && poiInfo.tags.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        <ShowMoreLess defaultItemCount={3} items={poiInfo.tags} t={t} />
      </div>
    ) : null;

  /**
   * Price
   */
  const poiPrice =
    poiInfo && poiInfo.price ? (
      <>
        <span className="text-gray-600">
          <Price price={poiInfo.price} />
        </span>
        <span className="text-gray-400">•</span>
      </>
    ) : null;

  /**
   * Rating
   */
  const poiRating =
    poiInfo && poiInfo.rating !== null ? (
      <div className="flex items-center">
        <RatingStars rating={`${poiInfo.rating ? poiInfo.rating * 20 : ""}`} />
        <span className="ml-1 text-gray-600">
          {poiInfo.rating?.toFixed(1)} ({poiInfo.ratingCount})
        </span>
      </div>
    ) : null;

  /**
   * Poi Hours
   */
  const poiHours =
    poiInfo && poiInfo.hours ? (
      <div className="flex items-center space-x-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-400"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <OpenedHours hourStr={poiInfo.hours || ""} t={t} />{" "}
      </div>
    ) : null;

  /**
   * Address
   */
  const poiAddress =
    poiInfo && poiInfo.address ? (
      <div className="flex w-full items-center justify-between">
        <div className="flex space-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div>
            <p className="text-gray-600">{poiInfo.address}</p>
          </div>
        </div>
        <Copy copyText={poiInfo.address} t={t} />
      </div>
    ) : null;

  /**
   * Web Site
   */
  const poiWeb =
    poiInfo && poiInfo.web ? (
      <div className="flex items-center space-x-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-400"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <a href={`${poiInfo.web}`} rel="noopener noreferrer" target="_blank" className="text-blue-600 hover:underline">
          {poiInfo.web}
        </a>
      </div>
    ) : null;

  /**
   * Phone
   */
  const poiPhone =
    poiInfo && poiInfo.phone ? (
      <div className="flex items-center space-x-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-400"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span className="text-gray-600">{poiInfo.phone}</span>
        <a className="text-blue-600 text-sm hover:underline" rel="noopener noreferrer" target="_blank" href={`tel:${poiInfo.phone}`}>
          {t("trips.myTrips.itinerary.step.poi.phone.callNow")}
        </a>
      </div>
    ) : null;

  /**
   * Description
   */
  const poiDescription =
    poiInfo && poiInfo.description ? (
      <div className="border-t border-b border-gray-100 py-4">
        <ReadMoreLess desc={poiInfo.description} defaultCharLenght={172} t={t} />
      </div>
    ) : null;

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-white text-[#434b55]">
      <AppNav header={PLACE_INFO.HEADER?.(t("tourInfo.header"))} />
      {poiInfo && !errorMessage ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header Section */}
          {/* <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-gray-900">{poiInfo.name}</h1>
            </div>
          </div> */}
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Restaurant Info Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Image Gallery */}
                <div className="lg:col-span-5 relative">
                  <PoiInfoImage poi={poiInfo} close={() => {}} hideButtons square t={t} />
                </div>
                {/* Info Section */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Header */}
                  <h1 className="text-2xl font-bold text-gray-900">{poiInfo.name}</h1>
                  {/* Price & Rating */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {poiPrice}
                      {poiRating}
                    </div>
                  </div>
                  {/* Description */}
                  {poiDescription}
                  {/* Hours */}
                  {poiHours}
                  {/* Address */}
                  {poiAddress}
                  {/* Website */}
                  {poiWeb}
                  {/* Phone */}
                  {poiPhone}
                  {/* Tags */}
                  <div className="space-y-4">
                    {poiCuisines}
                    {poiFeatures}
                  </div>
                  {openTableProduct && (
                    <div className="flex items-center w-full space-x-2">
                      <Button
                        text={t("trips.myTrips.itinerary.step.poi.bookATable.reserve")}
                        className="w-full"
                        color="danger"
                        onClick={() => {
                          if (openTableProduct.url) {
                            window.open(openTableProduct.url, "_blank");
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Map Section */}
                <div className="lg:col-span-3">
                  <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden shadow-md" style={{ position: "relative", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", position: "absolute", top: "0px", left: "0px", backgroundColor: "rgb(229, 227, 223)" }}>
                      <GoogleMapsPoiInfo poi={poiInfo} zoom={17} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {poiInfo.bookings.length > 0 && <TourAndTickets poiInfo={poiInfo} t={t} />}
          </div>
        </div>
      ) : (
        <div className="full-center" style={{ maxWidth: "100%", textAlign: "center" }}>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PlaceInfo;
