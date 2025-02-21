import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@tripian/core";
import useTranslate from "../../hooks/useTranslate";
import { EventList, PreLoading, SvgIcons } from "@tripian/react";
import AppNav from "../../App/AppNav/AppNav";
import { CITY_INFO } from "../../constants/ROUTER_PATH_TITLE";
import useCities from "../../hooks/useCities";
import Model, { helper } from "@tripian/model";
import moment from "moment";
import { useHistory, useParams } from "react-router";
import classes from "./CityInfoPage.module.scss";

export type RSelectOption = {
  id: number;
  label: string;
  payload: { destinationId: number; destinationName: string; parentName: string };
  isSelected?: boolean;
};

const CityInfoPage = () => {
  const { cities, loadingCities } = useCities();
  // const [selectedCityId, setSelectedCityId] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [info, setInfo] = useState<{ city: Model.City; details: Model.CityInfo; events: Model.CityEvent[] }>();
  const [error, setError] = useState<string>();
  const [showMore, setShowMore] = useState(false);

  const { t } = useTranslate();

  const { cityId } = useParams<{ cityId: string }>();

  const history = useHistory();

  moment.locale();

  const toggleShowMore = () => {
    setShowMore((prev) => !prev);
  };

  const handleCityInfoFetch = useCallback(async () => {
    if (cityId) {
      const selectedCityId = Number(cityId);
      setLoading(true);
      try {
        const cityInfo = await api.cityInfo(selectedCityId);
        const cityEvents = await api.cityEvents(selectedCityId);
        const city = cities?.find((city) => city.id === selectedCityId);
        if (city) {
          const info = { city, details: cityInfo, events: cityEvents };
          setInfo(info);
          setError(undefined);
        }
        setLoading(false);
      } catch (error: any) {
        setInfo(undefined);
        setError(error);
        setLoading(false);
      }
    }
  }, [cities, cityId]);

  useEffect(() => {
    if (cityId) {
      handleCityInfoFetch();
    }
  }, [cityId, handleCityInfoFetch]);

  const handleGoBack = () => {
    setInfo(undefined);
    history.goBack();
  };

  const formatMonths = useCallback((months: string[]): string => {
    const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthIndices = months
      .map((month) => allMonths.indexOf(month))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b);

    const ranges: { start: number; end: number }[] = [];
    let start = monthIndices[0];
    let end = monthIndices[0];

    for (let i = 1; i < monthIndices.length; i++) {
      if (monthIndices[i] === end + 1) {
        end = monthIndices[i];
      } else {
        ranges.push({ start, end });
        start = monthIndices[i];
        end = monthIndices[i];
      }
    }
    ranges.push({ start, end });

    const formattedRanges = ranges.map((range) => {
      if (range.start === range.end) {
        return allMonths[range.start].slice(0, 3);
      }
      return `${allMonths[range.start].slice(0, 3)} - ${allMonths[range.end].slice(0, 3)}`;
    });

    return formattedRanges.join(", ");
  }, []);

  /* */
  /* */
  /* ********* CITY INFO ********* */

  const cityImgDiv = useMemo(() => {
    if (info) {
      return (
        <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12">
          <img className="!w-full h-full object-cover" src={info.city ? helper.cityImgUrl(info.city.image.url || "", 800, 500) : ""} alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
            <button onClick={handleGoBack} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <SvgIcons.ArrowLeft />
            </button>
            <div className="absolute bottom-0 p-8">
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <SvgIcons.MapPin width="20" height="20" />
                <span className="text-lg">{info.city.country.name}</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">{info.city?.name}</h1>
              <p className="text-white/90 text-sm">{showMore ? info.city?.description : `${info.city?.description?.slice(0, 170)}...`} </p>
              <button onClick={toggleShowMore} className="text-white text-sm underline focus:outline-none">
                {showMore ? t("common.showLess") : t("common.showMore")}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, showMore]);

  const cityInfoDetails = useMemo(() => {
    if (info) {
      const { wifiInformation, lifeQualityIndices, emergencyNumbers, powerInformation, bestTimeToVisit } = info.details.information;
      const cityEvents = info.events;

      return (
        <div className={`grid gap-4 md:grid-cols-3 grid-cols-1 ${bestTimeToVisit && lifeQualityIndices ? "md:grid-rows-4 grid-rows-4" : "md:grid-rows-2 grid-rows-2"}`}>
          {cityEvents.length > 0 && (
            <div className={`bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow pb-6 ${bestTimeToVisit && lifeQualityIndices ? "row-span-4" : "row-span-2"}`}>
              <div className="flex items-center gap-3 mb-4 px-6 pt-6">
                <SvgIcons.Calendar2 className="text-primary-color" />
                <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.events.label")}</h2>
              </div>
              <div
                className={`flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-0 px-6 ${
                  bestTimeToVisit && lifeQualityIndices ? "max-h-[40rem]" : "max-h-[20rem]"
                }`}
              >
                <EventList events={cityEvents} t={t} />
              </div>
            </div>
          )}

          {bestTimeToVisit && (
            <div className="bg-gray-100 row-span-2 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <SvgIcons.Thermometer className="w-6 h-6 text-primary-color" />
                <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.bestTimeToVisit.label")}</h2>
              </div>
              <div className="space-y-4">
                {bestTimeToVisit.peakSeason && (
                  <div className="border-b border-gray-100 last:border-0 pb-3 pt-3 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-primary-color">{t("cityInfo.bestTimeToVisit.peakSeason")}</span>
                      <span className="text-sm text-gray-500">{formatMonths(bestTimeToVisit.peakSeason.months)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{bestTimeToVisit.peakSeason.description}</p>
                    {/* <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">🌡️ 25°C - 35°C</span>
                  <span className="text-gray-500">👥 High</span>
                </div> */}
                  </div>
                )}
                {bestTimeToVisit.shoulderSeason && (
                  <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-primary-color">{t("cityInfo.bestTimeToVisit.shoulderSeason")}</span>
                      <span className="text-sm text-gray-500">{formatMonths(bestTimeToVisit.shoulderSeason.months)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{bestTimeToVisit.shoulderSeason.description}</p>
                    {/* <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">🌡️ 15°C - 25°C</span>
                  <span className="text-gray-500">👥 Moderate</span>
                </div> */}
                  </div>
                )}
                {bestTimeToVisit.offSeason && (
                  <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-primary-color">{t("cityInfo.bestTimeToVisit.offSeason")}</span>
                      <span className="text-sm text-gray-500">{formatMonths(bestTimeToVisit.offSeason.months)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{bestTimeToVisit.offSeason.description}</p>
                    {/* <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">🌡️ 5°C - 15°C</span>
                  <span className="text-gray-500">👥 Low</span>
                </div> */}
                  </div>
                )}
              </div>
            </div>
          )}

          {lifeQualityIndices && (
            <div className="bg-gray-100 row-span-2 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <SvgIcons.Info3 className="w-6 h-6 text-primary-color" />
                <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.lifeQualityIndices.label")}</h2>
              </div>
              <div className="space-y-3">
                {lifeQualityIndices.safetyIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.safety")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.safetyIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.safetyIndex.value)}%</span>
                    </div>
                  </div>
                )}
                {lifeQualityIndices.healthCareIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.healthCare")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.healthCareIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.healthCareIndex.value)}%</span>
                    </div>
                  </div>
                )}
                {lifeQualityIndices.costOfLivingIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.costOfLiving")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.costOfLivingIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.costOfLivingIndex.value)}%</span>
                    </div>
                  </div>
                )}
                {lifeQualityIndices.climateIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.climate")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.climateIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.climateIndex.value)}%</span>
                    </div>
                  </div>
                )}
                {lifeQualityIndices.pollutionIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.pollution")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.pollutionIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.pollutionIndex.value)}%</span>
                    </div>
                  </div>
                )}
                {lifeQualityIndices.trafficCommuteTimeIndex && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">{t("cityInfo.lifeQualityIndices.trafficCommuteTime")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-primary-color" style={{ width: `${lifeQualityIndices.trafficCommuteTimeIndex.value}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(lifeQualityIndices.trafficCommuteTimeIndex.value)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {wifiInformation && (
            <div className="bg-gray-100 row-span-2 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <SvgIcons.Wifi className="w-6 h-6 text-primary-color" />
                  <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.wifiInformation.label")}</h2>
                </div>
                <ul className="space-y-3">
                  {wifiInformation.mobile && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">{t("cityInfo.wifiInformation.mobile")}</span>
                      <span className="font-medium text-gray-700">{wifiInformation.mobile}</span>
                    </li>
                  )}
                  {wifiInformation.broadband && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">{t("cityInfo.wifiInformation.broadband")}</span>
                      <span className="font-medium text-gray-700">{wifiInformation.broadband}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <SvgIcons.Power className="w-6 h-6 text-primary-color" />
                <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.powerInformation.label")}</h2>
              </div>
              <ul className="space-y-3">
                {powerInformation.voltage && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.powerInformation.voltage")}</span>
                    <span className="font-medium text-gray-700">{powerInformation.voltage}</span>
                  </li>
                )}
                {powerInformation.frequency && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.powerInformation.frequency")}</span>
                    <span className="font-medium text-gray-700">{powerInformation.frequency}</span>
                  </li>
                )}
                {powerInformation.plugs && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.powerInformation.plugs")}</span>
                    <span className="font-medium text-gray-700">{powerInformation.plugs.join(" & ")}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {emergencyNumbers && (
            <div className="bg-gray-100 row-span-2 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <SvgIcons.Phone2 className="w-6 h-6 text-primary-color" />
                <h2 className="text-xl font-semibold text-gray-800">{t("cityInfo.emergencyNumbers.label")}</h2>
              </div>
              <ul className="space-y-3">
                {emergencyNumbers.police && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.emergencyNumbers.police")}</span>
                    <span className="font-medium text-gray-700">{emergencyNumbers.police}</span>
                  </li>
                )}
                {emergencyNumbers.ambulance && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.emergencyNumbers.ambulance")}</span>
                    <span className="font-medium text-gray-700">{emergencyNumbers.ambulance}</span>
                  </li>
                )}
                {emergencyNumbers.fire && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">{t("cityInfo.emergencyNumbers.fire")}</span>
                    <span className="font-medium text-gray-700">{emergencyNumbers.fire}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);

  /* ********* CITY INFO ********* */
  /* */
  /* */

  return (
    <div>
      <AppNav header={CITY_INFO.HEADER?.(t("cityInfo.title"))} />
      {loadingCities ? (
        <div className={classes.loadingWrapper}>
          <PreLoading />
        </div>
      ) : (
        <div className="min-h-screen bg-background-color">
          <div className="container mx-auto px-4 py-12">
            {loading ? (
              <div className={classes.loadingWrapper}>
                <PreLoading />
              </div>
            ) : (
              <>
                {info && (
                  <>
                    {cityImgDiv} {cityInfoDetails}
                  </>
                )}
                {error && <div className="text-center">{error}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityInfoPage;
