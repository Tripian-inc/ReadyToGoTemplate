import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import moment from "moment";
import Model, { helper } from "@tripian/model";
import { api } from "@tripian/core";
import { BackButton, Button, OfferCard, PreLoading } from "@tripian/react";
import { CAMPAIGN_OFFERS, PLACE_INFO, QR_READER } from "../../constants/ROUTER_PATH_TITLE";
import useSearchOffer from "../../hooks/useSearchOffer";
import useMyOffers from "../../hooks/useMyOffers";
import AppNav from "../../App/AppNav/AppNav";
import classes from "./CampaignOffersPage.module.scss";
import useTranslate from "../../hooks/useTranslate";

const CampaignOffersPage = () => {
  const [loadingCampaign, setLoadingCampaign] = useState<boolean>(true);
  const [campaign, setCampaign] = useState<Model.Campaign>();

  const [loadingOffers, setLoadingOffers] = useState<boolean>(true);
  const [campaignOfferPois, setCampaignOfferPois] = useState<Model.Poi[]>();

  const [tab, setTab] = useState<Model.PRODUCT_TYPE_NAME>();
  const [displayOfferPois, setDisplayOfferPois] = useState<Model.Poi[]>();

  const { searchOfferCampaign } = useSearchOffer();
  const { isLoadingOffer, /* myAllOffers, */ offerOptIn, offerOptOut } = useMyOffers();

  const { campaignId } = useParams<{ campaignId: string }>();
  const history = useHistory();

  const { t } = useTranslate();

  document.title = CAMPAIGN_OFFERS.TITLE(t("trips.myTrips.itinerary.offers.campaignOffers.title"));

  useEffect(() => {
    setLoadingCampaign(true);
    api
      .businessCampaign(Number(campaignId))
      .then((c) => {
        if (c) setCampaign(c);
      })
      .finally(() => setLoadingCampaign(false));
  }, [campaignId]);

  const fetchCampaignOffers = useCallback(() => {
    if (campaign) {
      setLoadingOffers(true);
      searchOfferCampaign(campaign.id)
        .then((pois) => {
          const filteredPois = helper.deepCopy(pois.filter((x) => x.offers.some((y) => y.optInDate === null && y.redeemDate === null && y.campaign?.id === Number(campaignId))));
          filteredPois.forEach((poi) => {
            poi.offers = poi.offers.filter((y) => y.optInDate === null && y.redeemDate === null && y.campaign?.id === Number(campaignId));
          });
          setCampaignOfferPois(filteredPois);
        })
        .finally(() => {
          setLoadingOffers(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, searchOfferCampaign]);

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
        filteredPois = helper.deepCopy(campaignOfferPois.filter((x) => x.offers.some((y) => y.productType.name === tab)));
        filteredPois.forEach((poi) => {
          poi.offers = poi.offers.filter((y) => y.productType.name === tab);
        });
        setDisplayOfferPois(filteredPois);
      }
    }
  }, [campaignOfferPois, tab]);

  const offerCardClicked = useCallback(
    (optIn: boolean, id: number, optInDate?: string) => {
      if (campaign === undefined) return;
      if (optIn) {
        const dayFormatted = moment(optInDate || campaign.timeframe.start).format("YYYY-MM-DD");

        offerOptIn(id, dayFormatted).then(() => {
          fetchCampaignOffers();
        });
      } else {
        offerOptOut(id).then(() => {
          fetchCampaignOffers();
        });
      }
    },
    [campaign, fetchCampaignOffers, offerOptIn, offerOptOut]
  );

  return (
    <>
      <AppNav header={CAMPAIGN_OFFERS.HEADER?.(t("trips.myTrips.itinerary.offers.title"))} />
      {loadingCampaign || loadingOffers ? (
        <PreLoading />
      ) : (
        <div className={classes.campaignOffers}>
          <div className="w-full ml-4 mt-4 z-10">
            <BackButton text="Go Back to My Wallet" clicked={() => history.goBack()} />
          </div>
          <div className={classes.offerTabs}>
            <Button
              className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.EXPERIENCES ? classes.selected : classes.unSelected}`}
              text={t("trips.myTrips.itinerary.offers.categories.experiences")}
              onClick={() => {
                if (tab === Model.PRODUCT_TYPE_NAME.EXPERIENCES) {
                  setTab(undefined);
                } else {
                  setTab(Model.PRODUCT_TYPE_NAME.EXPERIENCES);
                }
              }}
            />
            <Button
              className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.DINING ? classes.selected : classes.unSelected}`}
              text={t("trips.myTrips.itinerary.offers.categories.dining")}
              onClick={() => {
                if (tab === Model.PRODUCT_TYPE_NAME.DINING) {
                  setTab(undefined);
                } else {
                  setTab(Model.PRODUCT_TYPE_NAME.DINING);
                }
              }}
            />
            <Button
              className={`${classes.offerTabButton} ${tab === Model.PRODUCT_TYPE_NAME.SHOPPING ? classes.selected : classes.unSelected}`}
              text={t("trips.myTrips.itinerary.offers.categories.shopping")}
              onClick={() => {
                if (tab === Model.PRODUCT_TYPE_NAME.SHOPPING) {
                  setTab(undefined);
                } else {
                  setTab(Model.PRODUCT_TYPE_NAME.SHOPPING);
                }
              }}
            />
          </div>
          {/* <TabMenu
            menuItems={[
              {
                title: "Experiences",
                onClick: () => {
                  setTab(Model.PRODUCT_TYPE_NAME.EXPERIENCES);
                },
              },
              {
                title: "Dining",
                onClick: () => {
                  setTab(Model.PRODUCT_TYPE_NAME.DINING);
                },
              },
              {
                title: "Shopping",
                onClick: () => {
                  setTab(Model.PRODUCT_TYPE_NAME.SHOPPING);
                },
              },
            ]}
            selectedIndex={tab === Model.PRODUCT_TYPE_NAME.EXPERIENCES ? 0 : tab === Model.PRODUCT_TYPE_NAME.DINING ? 1 : 2}
          /> */}

          <div className={classes.offer}>
            {displayOfferPois?.length === 0 && <h3 className="center mt10">{t("trips.myTrips.itinerary.offers.emptyOffersMessage")}</h3>}
            {displayOfferPois?.map((campaignOfferPoi) => {
              return campaignOfferPoi.offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  redeemClicked={() => history.push(QR_READER.PATH)}
                  optClicked={offerCardClicked}
                  cardClicked={() => window.open(`${PLACE_INFO.PATH}/${campaignOfferPoi.id}`, "_blank")}
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
          {window.tconfig.BRAND_NAME === "bookbarbados" && <div className={classes.backgroundImage} />}
        </div>
      )}
    </>
  );
};

export default CampaignOffersPage;
