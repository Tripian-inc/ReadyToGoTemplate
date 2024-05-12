import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@tripian/core";
import Model from "@tripian/model";
import { GoogleMapsPoiInfo, PageLoading, PoiInfoImage, PoiInfoText } from "@tripian/react";
import { PLACE_INFO } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";
import classes from "./PlaceInfo.module.scss";

const PlaceInfo = () => {
  const [poiInfo, setPoiInfo] = useState<Model.Poi>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { t } = useTranslate();

  document.title = PLACE_INFO.TITLE(t("placeInfo.header"));

  const { id } = useParams<{ id: string }>();

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

  if (loading) {
    return <PageLoading />;
  }

  const openTableProduct = poiInfo?.bookings.find((b) => b.providerId === Model.PROVIDER_ID.OPEN_TABLE)?.products[0];

  return (
    <>
      {poiInfo && !errorMessage ? (
        <div className={`${classes.placeInfo} row mb0`}>
          <div className="col col12 col6-m">
            <PoiInfoImage poi={poiInfo} close={() => {}} hideButtons square t={t} />
          </div>
          <div className="col col12 col6-m">
            <div className="row">
              <div className="col col12">
                <PoiInfoText
                  poi={poiInfo}
                  favoriteLoading={false}
                  favorite={false}
                  favoriteClick={() => {}}
                  addRemoveReplacePoi={() => {}}
                  hideActionButtons
                  hideBookingButton={!openTableProduct}
                  bookingButtonClick={() => {
                    if (openTableProduct) window.open(openTableProduct.url || "https://www.opentable.com");
                    // eslint-disable-next-line no-console
                    else console.log("Open Table değil.");
                  }}
                  RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
                  hideButtons
                  t={t}
                />
              </div>
              <div className="col col12" style={{ height: "320px", width: "100%" }}>
                <GoogleMapsPoiInfo poi={poiInfo} zoom={17} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="full-center" style={{ maxWidth: "100%", textAlign: "center" }}>
          <span>{errorMessage}</span>
        </div>
      )}
    </>
  );
};

export default PlaceInfo;
