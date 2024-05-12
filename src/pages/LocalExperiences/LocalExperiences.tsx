import React from "react";
import { useHistory, useLocation } from "react-router";
import Model, { Providers, helper } from "@tripian/model";
import useBbTours from "../../hooks/useBbTours";
import { useGygApi } from "../../hooks/useGygApi";
import useViatorApi from "../../hooks/useViatorApi";
import { BackButton, BbTourCard, CardSlider, GygTourCard, PreLoading, ViatorProductCard } from "@tripian/react";
import { LOCAL_EXPERIENCES, TOUR_INFO } from "../../constants/ROUTER_PATH_TITLE";
import { useDispatch } from "react-redux";
import { saveNotification } from "../../redux/action/trip";
import AppNav from "../../App/AppNav/AppNav";
import useTranslate from "../../hooks/useTranslate";

//http://localhost:3000/local-experiences?city_id=244&start_date=30-03-2024&end_date=13-04-2024&adult=1&children=0

const initialCatalog: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product)[] }[] = [
  { title: "Adventure", items: [] },
  { title: "Food", items: [] },
  { title: "Culture and History", items: [] },
  { title: "Sightseeing", items: [] },
  { title: "Art and Museums", items: [] },
  { title: "Local and Neighborhood", items: [] },
  { title: "Others", items: [] },
];

const LocalExperiencesPage = () => {
  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };
  const { city_id, city_name, start_date, end_date, adult, children } = useQuery<{
    city_id: string | undefined;
    city_name: string | undefined;
    start_date: string | undefined;
    end_date: string | undefined;
    adult: string | undefined;
    children: string | undefined;
  }>();

  const { bbToursCatalog, loadingBbTourCatalog } = useBbTours(Number(city_id), start_date, end_date);
  const { gygToursCatalog, gygLoaders } = useGygApi(Number(city_id), city_name, start_date, end_date, Number(adult), Number(children));
  const { loadingViatorProductCatalog, viatorProductCatalogGroup } = useViatorApi(city_name, start_date, end_date);

  const history = useHistory();
  const dispatch = useDispatch();

  const { t } = useTranslate();

  const tourCardSliderLoading = loadingBbTourCatalog || gygLoaders.tourCatalogLoader || loadingViatorProductCatalog;

  if (
    (gygToursCatalog === undefined || gygToursCatalog?.length === 0) &&
    (bbToursCatalog === undefined || (gygToursCatalog?.length === 0 && !tourCardSliderLoading)) &&
    (viatorProductCatalogGroup === undefined || (viatorProductCatalogGroup?.length === 0 && !tourCardSliderLoading))
  ) {
    return (
      <>
        <AppNav header={LOCAL_EXPERIENCES.HEADER?.(t("trips.myTrips.localExperiences.title"))} />
        <div className="mt-12 mx-auto p-4 text-center">{t("trips.myTrips.localExperiences.toursEmpty")}</div>
      </>
    );
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
    if (viatorProductCatalogGroup) catalogGroups.push(...viatorProductCatalogGroup);
  }

  const catalogs: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product)[] }[] = helper.deepCopy(initialCatalog);
  catalogGroups.forEach((cg) => {
    const catalog = catalogs.find((c) => c.title === cg.title);
    if (catalog) catalog.items.push(...cg.items);
    else catalogs[catalogs.length - 1].items.push(...cg.items);
  });

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

  if (tourCardSliderLoading) {
    return (
      <>
        <AppNav header={LOCAL_EXPERIENCES.HEADER?.(t("trips.myTrips.localExperiences.title"))} />
        <PreLoading />
      </>
    );
  }

  return (
    <div className="px-8 pb-8 bg-background-color h-full overflow-y-auto">
      <AppNav header={LOCAL_EXPERIENCES.HEADER?.(t("trips.myTrips.localExperiences.title"))} />
      {history.location.key && (
        <div className="mt-4">
          <BackButton
            fill="#000"
            clicked={() => {
              history.goBack();
            }}
          />
        </div>
      )}
      {catalogs.map(
        (c) =>
          0 < c.items.length && (
            <div className="row m0" key={`toursCatalogGroup-${c.title}`}>
              <div className="col col12 p0 m0">
                <h3 className="m4 mt8 text-xl font-bold">{c.title}</h3>
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
                                history.push(
                                  `${TOUR_INFO.PATH}/${
                                    Model.PROVIDER_ID.GYG
                                  }/${tourr.tour_id.toString()}?city_id=${city_id}&city_name=${city_name}&start_date=${start_date}&end_date=${end_date}&adults=${adult}${
                                    children ? `&children=${children}` : ""
                                  }`
                                );
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
                                if (product.offers.length === 0) {
                                  dispatch(
                                    saveNotification(
                                      Model.NOTIFICATION_TYPE.ERROR,
                                      t("notification.bookbarbadosFetch.name"),
                                      t("notification.bookbarbadosFetch.title"),
                                      t("notification.bookbarbadosFetch.message")
                                    )
                                  );
                                }

                                history.push(
                                  `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.BOOK_BARBADOS}/${product.info.id}?start_date=${start_date}&end_date=${end_date}&adults=${adult}${
                                    children ? `&children=${children}` : ""
                                  }`
                                );
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
                                history.push(
                                  `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VIATOR}/${product.productCode}?start_date=${start_date}&end_date=${end_date}&adults=${adult}${
                                    children ? `&children=${children}` : ""
                                  }`
                                );
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
    </div>
  );
};

export default LocalExperiencesPage;
