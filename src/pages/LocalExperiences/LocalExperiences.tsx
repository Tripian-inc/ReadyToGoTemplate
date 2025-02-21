import React from "react";
import { useHistory, useLocation } from "react-router";
import Model, { Providers, helper } from "@tripian/model";
import useBbTours from "../../hooks/useBbTours";
import { useGygApi } from "../../hooks/useGygApi";
import { BackButton, BbTourCard, CardSlider, GygTourCard, PreLoading, RezdyProductCard, ViatorProductCard, ToristyProductCard, VictoryProductCard } from "@tripian/react";
import { LOCAL_EXPERIENCES, TOUR_INFO } from "../../constants/ROUTER_PATH_TITLE";
import { useDispatch } from "react-redux";
import { saveNotification } from "../../redux/action/trip";
import AppNav from "../../App/AppNav/AppNav";
import useTranslate from "../../hooks/useTranslate";
import useRezdyApi from "../../hooks/useRezdyApi";
import useViatorCatalog from "../../hooks/useViatorCatalog";
import useToristyCatalog from "../../hooks/useToristyCatalog";
import useVictoryEvents from "../../hooks/useVictoryEvents";

//http://localhost:3000/local-experiences?city_id=244&start_date=30-03-2024&end_date=13-04-2024&adult=1&children=0

const initialCatalog: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product | Providers.Toristy.Product)[] }[] = [
  { title: "Adventure", items: [] },
  { title: "Food", items: [] },
  { title: "Culture and History", items: [] },
  { title: "Sightseeing", items: [] },
  { title: "Art and Museums", items: [] },
  { title: "Local and Neighborhood", items: [] },
  { title: "Rezdy Tours", items: [] },
  { title: "Others", items: [] },
];

const eventsInitialGroup = {
  title: "Events",
  items: [],
};

const LocalExperiencesPage = () => {
  const location = useLocation();
  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(location.search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };

  const { city_id, city_name, lat, lng, start_date, end_date, adult, children } = useQuery<{
    city_id: string | undefined;
    city_name: string | undefined;
    lat: string | undefined;
    lng: string | undefined;
    start_date: string | undefined;
    end_date: string | undefined;
    adult: string | undefined;
    children: string | undefined;
  }>();

  const { bbToursCatalog, loadingBbTourCatalog } = useBbTours(Number(city_id), start_date, end_date);
  const { gygToursCatalog, gygLoaders } = useGygApi(Number(city_id), city_name, start_date, end_date, Number(adult), Number(children));
  const { viatorToursCatalog, loadingViatorTourCatalog } = useViatorCatalog(city_name, start_date, end_date);
  const { loadingRezdyTours, rezdyProductCatalogGroup } = useRezdyApi(Number(city_id));
  const { toristyToursCatalog, loadingToristyTourCatalog } = useToristyCatalog(Number(city_id));
  const { victoryEventsCatalog, loadingVictoryEventCatalog } = useVictoryEvents(Number(lat), Number(lng), start_date, end_date);

  const history = useHistory();
  const dispatch = useDispatch();

  const { t } = useTranslate();

  const tourCardSliderLoading =
    loadingBbTourCatalog || gygLoaders.tourCatalogLoader || loadingRezdyTours || loadingViatorTourCatalog || loadingToristyTourCatalog || loadingVictoryEventCatalog;

  if (
    (gygToursCatalog === undefined || gygToursCatalog?.length === 0) &&
    (bbToursCatalog === undefined || (gygToursCatalog?.length === 0 && !tourCardSliderLoading)) &&
    (rezdyProductCatalogGroup === undefined || (rezdyProductCatalogGroup?.length === 0 && !tourCardSliderLoading)) &&
    (viatorToursCatalog === undefined || (viatorToursCatalog?.length === 0 && !tourCardSliderLoading)) &&
    (toristyToursCatalog === undefined || (toristyToursCatalog?.length === 0 && !tourCardSliderLoading)) &&
    (victoryEventsCatalog === undefined || (victoryEventsCatalog?.length === 0 && !tourCardSliderLoading))
  ) {
    return (
      <>
        <AppNav header={LOCAL_EXPERIENCES.HEADER?.(t("trips.myTrips.localExperiences.title"))} />
        <div className="mt-12 mx-auto p-4 text-center">{t("trips.myTrips.localExperiences.toursEmpty")}</div>
      </>
    );
  }

  let catalogGroups: (Providers.Gyg.CatalogGroup | Providers.Bb.CatalogGroup | Providers.Viator.CatalogGroup | Providers.Rezdy.CatalogGroup | Providers.Toristy.CatalogGroup)[] =
    [];

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
    if (viatorToursCatalog) catalogGroups.push(...viatorToursCatalog);
  }

  // Rezdy
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.REZDY)) {
    if (rezdyProductCatalogGroup) catalogGroups.push(...rezdyProductCatalogGroup);
  }

  // Toristy
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.TORISTY)) {
    if (toristyToursCatalog) catalogGroups.push(...toristyToursCatalog);
  }

  const catalogs: { title: string; items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product | Providers.Rezdy.Product | Providers.Toristy.Product)[] }[] =
    helper.deepCopy(initialCatalog);
  catalogGroups.forEach((cg) => {
    const catalog = catalogs.find((c) => c.title === cg.title);
    if (catalog) catalog.items.push(...cg.items);
    else catalogs[catalogs.length - 1].items.push(...cg.items);
  });

  const victoryEventsGroup: { title: string; items: Providers.Victory.Event[] } = helper.deepCopy(eventsInitialGroup);
  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.VICTORY) && Array.isArray(victoryEventsCatalog)) {
    victoryEventsCatalog.forEach((cg) => {
      if (Array.isArray(cg.items)) {
        victoryEventsGroup.items.push(...cg.items);
      }
    });
  }

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
      const aRezdyProduct = a as Providers.Rezdy.Product;
      const aToristyProduct = a as Providers.Toristy.Product;
      // Gyg
      if (aGygTour.tour_id) {
        aPrice = aGygTour.price ? aGygTour.price.values.amount : 0;
        // Bb
      } else if (aBbProduct.info) {
        let amount = aBbProduct.offers[0].priceBreakDowns.find((pb) => pb.touristType === "ADULT")?.price.amount;
        if (amount === undefined) {
          amount = aBbProduct.offers[0].priceBreakDowns[0].price.amount;
        }
        aPrice = amount ?? 0;
        // Viator
      } else if (aViProduct.translationInfo) {
        aPrice = aViProduct.pricing.summary.fromPrice ?? 0;
        // Rezdy
      } else if (aRezdyProduct.productCode) {
        let amount;
        if (aRezdyProduct.advertisedPrice) {
          amount = aRezdyProduct.advertisedPrice;
        } else {
          amount = aRezdyProduct.priceOptions?.[0].price;
        }
        aPrice = amount ?? 0;
        // Toristy
      } else {
        aPrice = Number(aToristyProduct.starting_price.price);
      }

      let bPrice = 0;
      const bGygTour = b as Providers.Gyg.Tour;
      const bBbProduct = b as Providers.Bb.Product;
      const bViProduct = a as Providers.Viator.Product;
      const bRezdyProduct = b as Providers.Rezdy.Product;
      const bToristyProduct = b as Providers.Toristy.Product;
      // Gyg
      if (bGygTour.tour_id) {
        bPrice = bGygTour.price ? bGygTour.price.values.amount : 0;
        // Bb
      } else if (bBbProduct.info) {
        let amount = bBbProduct.offers[0].priceBreakDowns.find((pb) => pb.touristType === "ADULT")?.price.amount;
        if (amount === undefined) {
          amount = bBbProduct.offers[0].priceBreakDowns[0].price.amount;
        }
        bPrice = amount ?? 0;
        // Viator
      } else if (aViProduct.translationInfo) {
        bPrice = bViProduct.pricing.summary.fromPrice ?? 0;
        // Rezdy
      } else if (bRezdyProduct.productCode) {
        let amount;
        if (bRezdyProduct.advertisedPrice) {
          amount = bRezdyProduct.advertisedPrice;
        } else {
          amount = bRezdyProduct.priceOptions?.[0].price;
        }
        bPrice = amount ?? 0;
        // Toristy
      } else {
        bPrice = Number(bToristyProduct.starting_price.price);
      }

      return aPrice - bPrice;
    });
  });

  const finalCatalogs: {
    title: string;
    items: (Providers.Gyg.Tour | Providers.Bb.Product | Providers.Viator.Product | Providers.Rezdy.Product | Providers.Toristy.Product | Providers.Victory.Event)[];
  }[] = [...catalogs];

  if (victoryEventsGroup.items.length > 0) {
    finalCatalogs.push(victoryEventsGroup);
  }

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
      {finalCatalogs.map(
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
                      const rezdyProduct = item as Providers.Rezdy.Product;
                      const toristyProduct = item as Providers.Toristy.Product;
                      const victoryEvent = item as Providers.Victory.Event;
                      if (c.title === "Events" && victoryEvent.id) {
                        return (
                          <div key={`${c.title}-${victoryEvent.id}`} role="button" tabIndex={index}>
                            <VictoryProductCard
                              product={victoryEvent}
                              bodyClicked={(product: Providers.Victory.Event) => {
                                history.push(`${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VICTORY}/${product.id}`);
                              }}
                              t={t}
                            />
                          </div>
                        );
                      } else if (gygTour.tour_id) {
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
                                  dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, t("notification.bookbarbadosFetch.name"), t("notification.bookbarbadosFetch.message")));
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
                      } else if (viProduct.translationInfo) {
                        return (
                          <div key={`${c.title}-${viProduct.productCode}`} role="button" tabIndex={index}>
                            <ViatorProductCard
                              product={viProduct}
                              bodyClicked={(product: Providers.Viator.Product) => {
                                history.push(
                                  `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.VIATOR}/${
                                    product.productCode
                                  }?city_id=${city_id}&city_name=${city_name}&start_date=${start_date}&end_date=${end_date}&adults=${adult}${
                                    children ? `&children=${children}` : ""
                                  }`,
                                  {
                                    customState: (location.state as { customState: string })?.customState,
                                    flags: viProduct.flags,
                                  }
                                );
                              }}
                              t={t}
                            />
                          </div>
                        );
                      } else if (rezdyProduct.productCode) {
                        return (
                          <div key={`${c.title}-${rezdyProduct.productCode}`} role="button" tabIndex={index}>
                            <RezdyProductCard
                              product={rezdyProduct}
                              bodyClicked={(product: Providers.Rezdy.Product) => {
                                history.push(
                                  `${TOUR_INFO.PATH}/${Model.PROVIDER_ID.REZDY}/${product.productCode}?start_date=${start_date}&end_date=${end_date}&adults=${adult}${
                                    children ? `&children=${children}` : ""
                                  }`
                                );
                              }}
                            />
                          </div>
                        );
                      } else if (toristyProduct.id) {
                        return (
                          <div key={`${c.title}-${toristyProduct.id}`} role="button" tabIndex={index}>
                            <ToristyProductCard
                              product={toristyProduct}
                              bodyClicked={(product: Providers.Toristy.Product) => {
                                history.push(`${TOUR_INFO.PATH}/${Model.PROVIDER_ID.TORISTY}/${product.id}`);
                              }}
                              t={t}
                            />
                          </div>
                        );
                      } else {
                        return null;
                      }
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
