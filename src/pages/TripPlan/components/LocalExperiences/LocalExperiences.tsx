/* eslint-disable react/require-default-props */

import React from "react";
import Model, { helper, Providers } from "@tripian/model";
import { CardSlider, CloseIconButton, GygTourCard, ModalFull, PreLoading, BbTourCard, ViatorProductCard } from "@tripian/react";
import useTranslate from "../../../../hooks/useTranslate";
import classes from "./LocalExperiences.module.scss";

const initialCatalog: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product)[] }[] = [
  { title: "Adventure", items: [] },
  { title: "Food", items: [] },
  { title: "Culture and History", items: [] },
  { title: "Sightseeing", items: [] },
  { title: "Art and Museums", items: [] },
  { title: "Local and Neighborhood", items: [] },
  { title: "Others", items: [] },
];

interface ILocalExperiences {
  show: boolean;
  close: () => void;
  tourCardSliderLoading: boolean;
  gygToursCatalog?: Providers.Gyg.CatalogGroup[];
  bbToursCatalog?: Providers.Bb.CatalogGroup[];
  viatorProductCatalog?: Providers.Viator.CatalogGroup[];
  tourCardClicked: (id: string) => void;
  gygtourCardClicked: (id: string) => void;
  bbTourCardClicked?: (product: Providers.Bb.Product) => void;
  viatorTourCardClicked: (productCode: string) => void;
}

const LocalExperiences: React.FC<ILocalExperiences> = ({
  show,
  close,
  gygToursCatalog,
  gygtourCardClicked,
  tourCardClicked,
  tourCardSliderLoading,
  bbToursCatalog,
  viatorProductCatalog,
  bbTourCardClicked,
  viatorTourCardClicked,
}) => {
  const { t } = useTranslate();

  const cardRows = () => {
    if (
      (gygToursCatalog === undefined || gygToursCatalog?.length === 0) &&
      (bbToursCatalog === undefined || (gygToursCatalog?.length === 0 && !tourCardSliderLoading)) &&
      (viatorProductCatalog === undefined || (viatorProductCatalog?.length === 0 && !tourCardSliderLoading))
    ) {
      return <div className={`${classes.noDataText} full-center-x mt12`}>There are no tours in this city on the trip date..</div>;
    }

    const catalogGroups: (Providers.Gyg.CatalogGroup | Providers.Bb.CatalogGroup | Providers.Viator.CatalogGroup)[] = [];

    /**
     * Multi Tours
     */

    // GYG
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
      if (gygToursCatalog) catalogGroups.push(...gygToursCatalog);
    }

    // BB
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS)) {
      if (bbToursCatalog) catalogGroups.push(...bbToursCatalog);
    }

    // Viator
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VIATOR)) {
      if (viatorProductCatalog) catalogGroups.push(...viatorProductCatalog);
    }

    const catalogs: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product)[] }[] = helper.deepCopy(initialCatalog);
    catalogGroups.forEach((cg) => {
      const catalog = catalogs.find((c) => c.title === cg.title);
      if (catalog) catalog.items.push(...cg.items);
      else catalogs[catalogs.length - 1].items.push(...cg.items);
    });

    // console.log(catalogs);

    /**
     * Sorts
     */
    catalogs.sort((a, b) => b.items.length - 4);
    catalogs.forEach((c) => {
      c.items.sort((a, b) => {
        let aPrice = 0;
        const aGygTour = a as Providers.Gyg.Tour;
        const aBbProduct = a as Providers.Bb.Product;
        const aViProduct = a as Providers.Viator.Product;
        if (aGygTour.tour_id) {
          aPrice = aGygTour.price ? aGygTour.price.values.amount : 0;
        } else if (aBbProduct.info) {
          let amount = aBbProduct.offers[0].priceBreakDowns.find((pb) => pb.touristType === "ADULT")?.price.amount;
          if (amount === undefined) {
            amount = aBbProduct.offers[0].priceBreakDowns[0].price.amount;
          }
          aPrice = amount ?? 0;
        } else {
          // Viator
          aPrice = aViProduct.pricing.summary.fromPrice ?? 0;
        }

        let bPrice = 0;
        const bGygTour = b as Providers.Gyg.Tour;
        const bBbProduct = b as Providers.Bb.Product;
        const bViProduct = a as Providers.Viator.Product;
        if (bGygTour.tour_id) {
          bPrice = bGygTour.price ? bGygTour.price.values.amount : 0;
        } else if (bBbProduct.info) {
          let amount = bBbProduct.offers[0].priceBreakDowns.find((pb) => pb.touristType === "ADULT")?.price.amount;
          if (amount === undefined) {
            amount = bBbProduct.offers[0].priceBreakDowns[0].price.amount;
          }
          bPrice = amount ?? 0;
        } else {
          // Viator
          bPrice = bViProduct.pricing.summary.fromPrice ?? 0;
        }

        return aPrice - bPrice;
      });
    });
    /**
     * Sorts
     */

    return (
      <>
        {catalogs.map(
          (c) =>
            0 < c.items.length && (
              <div className={`row m0 ${classes.localExperiencesCategory}`} key={`toursCatalogGroup-${c.title}`}>
                <div className="col col12 p0 m0">
                  <h3 className="m4 mt8">{c.title}</h3>
                  <div>
                    <CardSlider>
                      {c.items.map((item, index) => {
                        const gygTour = item as Providers.Gyg.Tour;
                        const bbProduct = item as Providers.Bb.Product;
                        const viProduct = item as Providers.Viator.Product;
                        if (gygTour.tour_id) {
                          return (
                            <div key={`${c.title}-${gygTour.tour_id}`} onKeyPress={() => {}} role="button" tabIndex={index}>
                              <GygTourCard
                                tour={gygTour}
                                bodyClicked={(tourr: Providers.Gyg.Tour) => {
                                  gygtourCardClicked(tourr.tour_id.toString());
                                }}
                                t={t}
                              />
                            </div>
                          );
                        } else if (bbProduct.info) {
                          return (
                            <div key={`${c.title}-${bbProduct.info.id}`} onKeyPress={() => {}} role="button" tabIndex={index}>
                              <BbTourCard
                                tour={bbProduct}
                                bodyClicked={(product: Providers.Bb.Product) => {
                                  if (bbTourCardClicked) bbTourCardClicked(product);
                                }}
                                t={t}
                              />
                            </div>
                          );
                        } else if (viProduct.productCode) {
                          return (
                            <div key={`${c.title}-${viProduct.productCode}`} role="button" tabIndex={index}>
                              <ViatorProductCard
                                product={viProduct}
                                bodyClicked={(product: Providers.Viator.Product) => {
                                  viatorTourCardClicked(viProduct.productCode);
                                }}
                              />
                            </div>
                          );
                        } else return null;
                      })}
                    </CardSlider>
                  </div>
                </div>
                <></>
              </div>
            )
        )}
      </>
    );
  };

  return (
    <ModalFull
      className={`${classes.localExperiencesModal} scrollable-y`}
      show={show}
      style={window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL ? { background: `url(${window.tconfig.IMAGE_PATHS.APP_BACKGROUND_IMG_URL})` } : {}}
    >
      <div className="row mb0 px5">
        <div className="col col12 mt5 p0 mb0">
          <h1 className="center mt10">{t("trips.myTrips.localExperiences.title").toUpperCase()}</h1>
          <div className={`${classes.modalCloseIcon} m2`}>
            <CloseIconButton fill="#fff" clicked={close} />
          </div>
        </div>
      </div>
      {tourCardSliderLoading ? <PreLoading /> : cardRows()}
      <div className="row pb2" />
    </ModalFull>
  );
};

export default LocalExperiences;
