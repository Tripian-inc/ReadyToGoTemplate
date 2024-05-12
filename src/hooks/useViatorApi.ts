import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const initialCatalog: Providers.Viator.CatalogGroup[] = [
  { title: "Adventure", items: [], parentTagIds: [22046] },
  { title: "Food", items: [], parentTagIds: [21482, 12208, 12694, 12713, 13285, 13288, 16548, 20245, 21482, 21567, 21911] },
  { title: "Culture and History", items: [], parentTagIds: [21479, 21511, 21517, 21910] },
  { title: "Sightseeing", items: [], parentTagIds: [11926, 11941, 12989, 20241, 21725, 21729, 21913] },
  { title: "Art and Museums", items: [], parentTagIds: [10847, 12716, 13109, 21514] },
  { title: "Local and Neighborhood", items: [], parentTagIds: [11265, 12208, 21754] },
  { title: "Others", items: [], parentTagIds: [] },
];

const useViatorApi = (cityName?: string, arrivalDatetime?: string, departureDatetime?: string) => {
  const [loadingViatorProductCatalog, setLoadingViatorProductCatalog] = useState<boolean>(true);
  const [viatorProducts, setViatorProducts] = useState<Providers.Viator.Product[]>();
  const [viatorProductCatalogGroup, setViatorProductCatalogGroup] = useState(initialCatalog);

  const [loadingViatorProductInfo, setLoadingViatorProductInfo] = useState<boolean>(true);
  const [viatorProductInfo, setViatorProductInfo] = useState<Providers.Viator.ProductInfo>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (viatorProducts) {
      const newCatalog: Providers.Viator.CatalogGroup[] = helper.deepCopy(initialCatalog);

      viatorProducts.forEach((p) => {
        newCatalog.forEach((c) => {
          let includes = false;
          for (let i = 0; i < p.tags.length; i++) {
            const tag = p.tags[i];
            if (c.parentTagIds.includes(tag)) {
              includes = true;
            }
            if (includes) break;
          }

          if (includes) {
            c.items.push(p);
          }
        });

        const added = newCatalog.reduce((p: string[], c: Providers.Viator.CatalogGroup) => [...p, ...c.items.map((x) => x.productCode)], []).some((y) => y === p.productCode);
        if (added === false) newCatalog[newCatalog.length - 1].items.push(p);
      });

      setViatorProductCatalogGroup(newCatalog);
      setLoadingViatorProductCatalog(false);
    }
  }, [viatorProducts]);

  useEffect(() => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
      if (providers.viator && cityName && arrivalDatetime && departureDatetime && window.tconfig.SHOW_TOURS_AND_TICKETS) {
        providers.viator
          .products(cityName, arrivalDatetime, departureDatetime)
          .then((products: Providers.Viator.Product[]) => {
            setViatorProducts(products);
          })
          .catch((viatorFetchToursError) => {
            dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "ViatorFetchToursError", "Viator Fetch Tours", viatorFetchToursError));
            setLoadingViatorProductCatalog(false);
          });
      } else {
        setLoadingViatorProductCatalog(false);
      }
    } else {
      setLoadingViatorProductCatalog(false);
    }
  }, [arrivalDatetime, cityName, departureDatetime, dispatch]);

  const fetchProductInfo = useCallback(
    (productCode: string): Promise<Boolean> => {
      setLoadingViatorProductInfo(true);
      setViatorProductInfo(undefined);

      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR)) {
        if (providers.viator && /* tripReference && */ window.tconfig.SHOW_TOURS_AND_TICKETS) {
          return providers.viator
            .productInfo(productCode)
            .then((pi: Providers.Viator.ProductInfo) => {
              setViatorProductInfo(pi);
              setLoadingViatorProductInfo(false);
              return true;
            })
            .catch((viatorFetchProductInfoError) => {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "viatorFetchTourError", "Viator Fetch Product Info", viatorFetchProductInfoError));
              setLoadingViatorProductInfo(false);
              return false;
            });
        }
      }

      setLoadingViatorProductInfo(false);
      return Promise.resolve(false);
    },
    [dispatch]
  );

  return { loadingViatorProductCatalog, viatorProductCatalogGroup, fetchProductInfo, loadingViatorProductInfo, viatorProductInfo };
};

export default useViatorApi;
