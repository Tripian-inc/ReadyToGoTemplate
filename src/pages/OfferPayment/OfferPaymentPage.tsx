import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router";
import Model from "@tripian/model";
import { api } from "@tripian/core";
import { PreLoading } from "@tripian/react";
import { MY_WALLET, OFFER_PAYMENT } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";
import classes from "./OfferPaymentPage.module.scss";

const OfferPaymentPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const [offer, setOffer] = useState<Model.Offer>();
  // const [coupon, setCoupon] = useState<Model.Coupon>();

  const { offerId } = useParams<{ offerId: string }>();

  const { t } = useTranslate();

  const isRegularOffer = useMemo(() => {
    if (offer?.offerType !== Model.OFFER_TYPE.VOUCHER) return true;

    return false;
  }, [offer?.offerType]);

  useEffect(() => {
    console.log("TTTT", t("trips.myTrips.itinerary.offers.payment.error.notFound"));
    api
      .offer(Number(offerId))
      .then((o) => {
        if (o) {
          setOffer(o);
          if (o.offerType !== Model.OFFER_TYPE.VOUCHER) setLoading(false);
        } else {
          setErrorMessage(t("trips.myTrips.itinerary.offers.payment.error.notFound"));
          setLoading(false);
        }
      })
      .catch(() => {
        setErrorMessage(t("trips.myTrips.itinerary.offers.payment.error.somethingWentWrong"));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  useEffect(() => {
    if (offer && !isRegularOffer) {
      api
        .coupons(1, 1000)
        .then((cs) => {
          const relatedCampaignCoupon = cs.data.find((x) => x.campaign.id === offer.campaign?.id);
          if (relatedCampaignCoupon) {
            /* if (offer.discount <= relatedCampaignCoupon.balance) { */
            // setCoupon(relatedCampaignCoupon);
            /* } else {
              setErrorMessage("Sorry, you don't have enough funds in your wallet for this offer payment.!");
            } */
          } else {
            setErrorMessage(t("trips.myTrips.itinerary.offers.payment.error.youDontHaveCoupon"));
          }
        })
        .catch(() => {
          setErrorMessage(t("trips.myTrips.itinerary.offers.payment.error.notFound"));
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);

  const payment = () => {
    setLoading(true);
    api
      .payment(Number(offerId))
      .then((newCoupon) => {
        if (newCoupon) {
          setSuccessMessage(t("trips.myTrips.itinerary.offers.payment.success.redeemed"));
          // setCoupon(newCoupon);
        } else {
          setErrorMessage(t("trips.myTrips.itinerary.offers.payment.error.paymentCouldNotBeCompleted"));
        }
      })
      .catch((errMessage) => {
        setErrorMessage(errMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const history = useHistory();
  document.title = OFFER_PAYMENT.TITLE(t("offerPayment.header"));

  if (loading) return <PreLoading />;

  if (errorMessage)
    return (
      <div className={classes.offerPayment}>
        <div className="h-full flex flex-col justify-around items-center">
          <div className="text-lg px-12 text-center text-white">{errorMessage}</div>
          <div className="w-full flex flex-row justify-around mt-8">
            <div className={`py-4 px-16 text-lg rounded-2xl cursor-pointer ${classes.button}`} onClick={() => history.goBack()}>
              {t("trips.myTrips.itinerary.offers.payment.goBack")}
            </div>
          </div>
        </div>
      </div>
    );

  if (successMessage)
    return (
      <div className={classes.offerPayment}>
        <div className="h-full flex flex-col justify-around items-center">
          <div className="text-lg px-12 text-center">{successMessage}</div>
          <div className="w-full flex flex-row justify-around mt-8">
            {isRegularOffer ? (
              <div className={`py-4 px-16 text-lg rounded-2xl cursor-pointer ${classes.button}`} onClick={() => history.goBack()}>
                Go back
              </div>
            ) : (
              <div className={`py-4 px-16 text-lg rounded-2xl cursor-pointer ${classes.button}`} onClick={() => history.replace(MY_WALLET.PATH)}>
                {t("trips.myTrips.itinerary.offers.payment.myWallet")}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className={classes.offerPayment}>
      <div className="h-full flex flex-col justify-center items-center">
        {isRegularOffer ? (
          <div style={{ textAlign: "center" }}>
            <h2 className="text-3xl mt-12 mb-40 font-brume">{offer?.title}</h2>
            <div className="text-lg px-12 text-center">Do You Wish To Redeem?</div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl mt-12 mb-40 font-brume">{offer?.campaign?.title}</h2>
            <div className="text-lg px-12 text-center">
              {offer?.currency}
              {offer?.discount} {t("trips.myTrips.itinerary.offers.payment.willBeBeducted")}
            </div>
            <div className="text-lg px-12 text-center">{t("trips.myTrips.itinerary.offers.payment.fromYourWallet")}</div>
          </div>
        )}

        <div className="text-xl p-12 text-center">{t("trips.myTrips.itinerary.offers.payment.doYouConfirm")}</div>

        <div className="w-full flex flex-row justify-around mt-8">
          <div className={`py-4 px-16 text-lg rounded-2xl cursor-pointer ${classes.button}`} onClick={payment}>
            {t("trips.myTrips.itinerary.offers.payment.submit")}
          </div>
          <div className={`py-4 px-16 text-lg rounded-2xl cursor-pointer ${classes.button}`} onClick={() => history.goBack()}>
            {t("trips.myTrips.itinerary.offers.payment.cancel")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPaymentPage;
