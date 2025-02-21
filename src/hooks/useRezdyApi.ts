import { useCallback, useEffect, useState } from "react";
import Model, { Providers, helper } from "@tripian/model";
import { providers } from "@tripian/core";
import { useDispatch } from "react-redux";
import { saveNotification } from "../redux/action/trip";

const initialCatalog: Providers.Rezdy.CatalogGroup[] = [
  { title: "Adventure", items: [], parentTags: [] },
  { title: "Food", items: [], parentTags: [] },
  { title: "Culture and History", items: [], parentTags: [] },
  { title: "Sightseeing", items: [], parentTags: [] },
  { title: "Art and Museums", items: [], parentTags: [] },
  { title: "Local and Neighborhood", items: [], parentTags: [] },
  { title: "Others", items: [], parentTags: [] },
  { title: "Rezdy Tours", items: [], parentTags: ["ACTIVITY", "CUSTOM", "DAYTOUR", "PRIVATE_TOUR", "TICKET", "LESSON"] },
];

const useRezdyApi = (cityId: number) => {
  const [loadingRezdyProductInfo, setLoadingRezdyProductInfo] = useState<boolean>(true);
  const [rezdyProductInfo, setRezdyProductInfo] = useState<Providers.Rezdy.Product>();

  const [loadingRezdyTours, setLoadingRezdyTours] = useState<boolean>(false);
  const [rezdyProducts, setRezdyProducts] = useState<Providers.Rezdy.Product[]>([]);
  const [rezdyProductCatalogGroup, setRezdyProductCatalogGroup] = useState(initialCatalog);

  const dispatch = useDispatch();

  const fetchProducts = useCallback(() => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.REZDY && (cityId === 341 || cityId === 625))) {
      setLoadingRezdyTours(true);
      setRezdyProducts([]);

      providers.rezdy
        ?.searchProducts()
        .then((products: Providers.Rezdy.Product[]) => {
          if (products) {
            const newCatalog: Providers.Rezdy.CatalogGroup[] = helper.deepCopy(initialCatalog);
            const filteredProducts = products.filter((product) => product.name && product.advertisedPrice);

            filteredProducts.forEach((p: Providers.Rezdy.Product) => {
              let foundGroup = false;

              newCatalog.forEach((c: Providers.Rezdy.CatalogGroup) => {
                if (c.parentTags?.includes(p.productType)) {
                  c.items.push(p);
                  foundGroup = true;
                }
              });

              if (!foundGroup) {
                newCatalog.find((group) => group.title === "Others")?.items.push(p);
              }
            });

            setRezdyProductCatalogGroup(newCatalog);
            setRezdyProducts(filteredProducts);
          }
        })
        .catch((rezdyFetchProductsError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "rezdyFetchProductsError", "Rezdy Fetch Tours", rezdyFetchProductsError));
        })
        .finally(() => {
          setLoadingRezdyTours(false);
        });
    }
  }, [cityId, dispatch]);

  const fetchProductInfo = useCallback(
    (productCode: string): Promise<Boolean> => {
      setLoadingRezdyProductInfo(true);
      setRezdyProductInfo(undefined);

      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.REZDY)) {
        if (providers.rezdy && window.tconfig.SHOW_TOURS_AND_TICKETS) {
          return providers.rezdy
            .productInfo(productCode)
            .then((pi) => {
              setRezdyProductInfo(pi);
              setLoadingRezdyProductInfo(false);
              return true;
            })
            .catch((rezdyFetchProductInfoError) => {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "rezdyFetchTourError", "Rezdy Fetch Product Info", rezdyFetchProductInfoError));
              setLoadingRezdyProductInfo(false);
              return false;
            });
        }
      }

      setLoadingRezdyProductInfo(false);
      return Promise.resolve(false);
    },
    [dispatch]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { loadingRezdyTours, rezdyProducts, rezdyProductCatalogGroup, fetchProductInfo, loadingRezdyProductInfo, rezdyProductInfo };
};

export default useRezdyApi;
