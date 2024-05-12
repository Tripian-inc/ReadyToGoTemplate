import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import QRCode from "react-qr-code";
import { QR_WRITER } from "../../constants/ROUTER_PATH_TITLE";
import classes from "./QrWriterPage.module.scss";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import useUser from "../../hooks/useUser";
import useTranslate from "../../hooks/useTranslate";

const QrWriterPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState<boolean>(false);
  const [offer, setOffer] = useState<Model.Offer | undefined>(undefined);

  const { user } = useUser();

  const { t } = useTranslate();

  const { offerId: p } = useParams<{ offerId: string }>();
  const offerId = isNaN(+p) ? 0 : +p;

  const history = useHistory();
  document.title = QR_WRITER.TITLE(t("qrCode.header"));

  useEffect(() => {
    // console.log("offerId", offerId);

    if (offerId === 0) {
      setError(t("trips.myTrips.itinerary.offers.qrWriter.error.invalidOfferId"));
      setLoading(false);
      return;
    }

    api
      .offer(offerId)
      .then((offer) => {
        if (offer === null) {
          setError(t("trips.myTrips.itinerary.offers.qrWriter.error.offerNotFound"));
          return;
        }

        if (offer.optInDate === undefined) {
          // setError("Offer not opted in");
          // return;
        }

        if (offer.redeemDate !== null) {
          setError(t("trips.myTrips.itinerary.offers.qrWriter.error.offerAlreadyRedeemed"));
          return;
        }

        if (offer.qrUrl === undefined) {
          setError(t("trips.myTrips.itinerary.offers.qrWriter.error.qrCodeNotFound"));
          return;
        }

        setOffer(offer);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (offer && completed === false) {
      const checkOfferStatus = () => {
        api.offerRedeemStatus(offer.id).then((redeemStatus) => {
          if (redeemStatus === "completed") {
            setCompleted(true);
          } else {
            timer = setTimeout(() => {
              checkOfferStatus();
            }, 3000);
          }
        });
      };

      checkOfferStatus();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [offer, completed]);

  return (
    <div className={classes.qrWriter}>
      <h1>{t("trips.myTrips.itinerary.offers.qrWriter.title")}</h1>
      {error && (
        <p>
          {t("trips.myTrips.itinerary.offers.qrWriter.error.anErrorOccurred")}: {error}
        </p>
      )}
      {completed && <p>{t("trips.myTrips.itinerary.offers.qrWriter.completed")}</p>}
      {offer && !completed && error === undefined && (
        <div style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
          <QRCode value={offer?.qrUrl ? `https://${offer?.qrUrl}` : `https://business-bookbarbados-dev.tripian.com/offer-payment/${offer?.id ?? 0}/${user?.id ?? 0}`} />
        </div>
      )}
      {loading ? (
        <p>{"trips.myTrips.itinerary.offers.qrWriter.loading"}...</p>
      ) : (
        <button onClick={() => history.push("/my-wallet")}>{t("trips.myTrips.itinerary.offers.qrWriter.back")}</button>
      )}
    </div>
  );
};

export default QrWriterPage;
