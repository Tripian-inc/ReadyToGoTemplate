import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { saveNotification } from "../../redux/action/user";
import moment from "moment";
import Model, { helper } from "@tripian/model";
import { api } from "@tripian/core";
import { Button, CouponCard, OfferCard, PreLoading } from "@tripian/react";
import { CAMPAIGN_OFFERS, MY_WALLET, PLACE_INFO, QR_READER, QR_WRITER } from "../../constants/ROUTER_PATH_TITLE";
import useSearchOffer from "../../hooks/useSearchOffer";
import useMyOffers from "../../hooks/useMyOffers";
import AppNav from "../../App/AppNav/AppNav";
import useTranslate from "../../hooks/useTranslate";
import classes from "./MyWallet.module.scss";

enum CAMPAIGN_OFFER_STATUS {
  OPTED_IN = "Opted-in",
  REDEEMED = "Redeemed",
}

const MyWalletPage = () => {
  const [coupons, setCoupons] = useState<Model.Coupon[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [campaignOfferPois, setCampaignOfferPois] = useState<Model.Poi[]>();

  const [tab, setTab] = useState<CAMPAIGN_OFFER_STATUS>(CAMPAIGN_OFFER_STATUS.OPTED_IN);
  const [displayOfferPois, setDisplayOfferPois] = useState<Model.Poi[]>();

  const { myOfferCampaign } = useSearchOffer();
  const { isLoadingOffer, /* myAllOffers, */ offerOptIn, offerOptOut } = useMyOffers();

  const history = useHistory();
  const dispatch = useDispatch();

  const { t } = useTranslate();

  document.title = MY_WALLET.TITLE(t("user.myWallet.title"));

  const fetchCampaignOffers = useCallback(() => {
    if (coupons) {
      if (0 < coupons.length) {
        setLoading(true);
        myOfferCampaign(coupons[0].id)
          .then((pois) => {
            const filteredPois = helper.deepCopy(pois.filter((x) => x.offers.some((y) => y.optInDate !== null || y.redeemDate !== null)));
            filteredPois.forEach((poi) => {
              poi.offers = poi.offers.filter((y) => y.optInDate !== null || y.redeemDate !== null);
            });
            setCampaignOfferPois(filteredPois);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, [coupons, myOfferCampaign]);

  const fetchCoupons = useCallback(() => {
    api.coupons(1).then((cs) => {
      setCoupons(cs.data);
    });
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchCampaignOffers();
  }, [fetchCampaignOffers]);

  useEffect(() => {
    if (campaignOfferPois) {
      let filteredPois: Model.Poi[] = [];
      if (tab === undefined) {
        filteredPois = helper.deepCopy(campaignOfferPois);
        setDisplayOfferPois(filteredPois);
      } else {
        filteredPois = helper.deepCopy(campaignOfferPois.filter((x) => x.offers.some((y) => y.optInDate !== null || y.redeemDate !== null)));
        filteredPois.forEach((poi) => {
          poi.offers = poi.offers.filter((y) => {
            if (tab === CAMPAIGN_OFFER_STATUS.OPTED_IN) {
              return y.optInDate !== null && y.redeemDate === null;
            } else {
              return y.redeemDate !== null;
            }
          });
        });
        setDisplayOfferPois(filteredPois);
      }
    }
  }, [campaignOfferPois, tab]);

  const offerCardClicked = (optIn: boolean, id: number, optInDate?: string) => {
    if (coupons === undefined) return;

    if (optIn) {
      const baseDate = moment(optInDate || coupons[0].campaign.timeframe.start);
      const currentTime = moment();
      const dateTime = baseDate
        .set({
          hour: currentTime.hour(),
          minute: currentTime.minute(),
          second: currentTime.second(),
        })
        .tz(coupons[0].campaign.timezone)
        .format("YYYY-MM-DD HH:mm:ss");
      offerOptIn(id, moment(dateTime).format("YYYY-MM-DD")).then(() => {
        fetchCampaignOffers();
      });
    } else {
      offerOptOut(id).then(() => {
        fetchCoupons();
        fetchCampaignOffers();
      });
    }
  };

  const noOfferMessages = useMemo(() => {
    if (tab === CAMPAIGN_OFFER_STATUS.OPTED_IN && displayOfferPois?.filter((poi) => poi.offers.some((offer) => offer.optInDate !== null)).length === 0) {
      return <h3 className={`center my-8 ${classes.textMessages}`}>You don't have any opted-in offers...</h3>;
    }
    if (tab === CAMPAIGN_OFFER_STATUS.REDEEMED && displayOfferPois?.filter((poi) => poi.offers.some((offer) => offer.redeemDate !== null)).length === 0) {
      return <h3 className={`center my-8 ${classes.textMessages}`}>You haven’t redeemed any offers yet...</h3>;
    }
  }, [displayOfferPois, tab]);

  return (
    <>
      <AppNav header={MY_WALLET.HEADER?.(t("user.myWallet.title"))} />
      {loading ? (
        <PreLoading />
      ) : (
        <div className={classes.myWallet}>
          {!coupons || coupons.length === 0 ? (
            <h3 className={`center mt-10 ${classes.textMessages}`}>{t("user.myWallet.emptyMessage")}</h3>
          ) : (
            <>
              <div>
                {coupons.map((coupon) => (
                  <div key={coupon.id} className={classes.coupon}>
                    <CouponCard coupon={coupon} viewOffersClicked={() => history.push(`${CAMPAIGN_OFFERS.PATH}/${coupon.campaign.id}`)} />
                  </div>
                ))}
              </div>
              {/* <Button onClick={fetchCampaignOffers} text="Show Campaign Offers" /> */}

              <div className={classes.offer}>
                <div className={classes.offerTabs}>
                  <Button
                    className={`${classes.offerTabButton} ${tab === CAMPAIGN_OFFER_STATUS.OPTED_IN ? classes.selected : classes.unSelected}`}
                    text={CAMPAIGN_OFFER_STATUS.OPTED_IN}
                    onClick={() => {
                      setTab(CAMPAIGN_OFFER_STATUS.OPTED_IN);
                    }}
                  />
                  <Button
                    className={`${classes.offerTabButton} ${tab === CAMPAIGN_OFFER_STATUS.REDEEMED ? classes.selected : classes.unSelected}`}
                    text={CAMPAIGN_OFFER_STATUS.REDEEMED}
                    onClick={() => {
                      setTab(CAMPAIGN_OFFER_STATUS.REDEEMED);
                    }}
                  />
                </div>
                {noOfferMessages}
                {/* <h3 className="center my-8 max-md:text-white">Opted-in to</h3> */}
                {displayOfferPois?.map((campaignOfferPoi) => {
                  return campaignOfferPoi.offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      redeemClicked={() => {
                        if (window.tconfig.QR_READER === "business") {
                          /**
                           *
                           * QR kodu business okuyor.
                           *
                           */
                          history.push(QR_WRITER.PATH + `/${offer.id}`);
                        } else {
                          /**
                           *
                           * QR kodu customer okuyor.
                           *
                           */
                          // if(validStartDate - 1 <= bugün AND bugün <= validEndDate + 1)
                          if (
                            moment(coupons[0].validStartDate).add(-1, "days").utcOffset(0) <= moment().utcOffset(0) &&
                            moment().utcOffset(0) <= moment(coupons[0].validEndDate).add(1, "days").utcOffset(0)
                          ) {
                            history.push(QR_READER.PATH);
                          } else {
                            dispatch(
                              saveNotification(Model.NOTIFICATION_TYPE.WARNING, t("notification.couponValidDateWarning.name"), t("notification.couponValidDateWarning.message"))
                            );
                          }
                        }
                      }}
                      cardClicked={() => window.open(`${PLACE_INFO.PATH}/${campaignOfferPoi.id}`, "_blank")}
                      optClicked={offerCardClicked}
                      poiName={campaignOfferPoi.name}
                      planDate={offer.campaign?.timeframe.start}
                      /* planDate={moment().add(2, "day").toString()} */
                      offer={offer}
                      isLoadingOffer={isLoadingOffer}
                      optedIn={offer.optInDate !== null}
                    />
                  ));
                })}
              </div>
            </>
          )}
          {window.tconfig.BRAND_NAME === "bookbarbados" && <div className={classes.backgroundImage} />}
        </div>
      )}
    </>
  );
};

export default MyWalletPage;
