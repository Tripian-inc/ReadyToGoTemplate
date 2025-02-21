import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const initialCatalog: Providers.Toristy.CatalogGroup[] = [
  { title: "Adventure", items: [], parentTagIds: [123, 61, 122, 125, 124, 126, 127] },
  { title: "Food", items: [], parentTagIds: [126, 127] },
  { title: "Culture and History", items: [], parentTagIds: [8, 114] },
  { title: "Sightseeing", items: [], parentTagIds: [105, 30] },
  { title: "Art and Museums", items: [], parentTagIds: [63, 25, 116] },
  { title: "Local and Neighborhood", items: [], parentTagIds: [11265, 12208, 21754] },
  { title: "Others", items: [], parentTagIds: [] },
];

const useToristyCatalog = (cityId?: number) => {
  const [toristyProducts, setToristyProducts] = useState<Providers.Toristy.Product[]>();
  const [toristyToursCatalog, setToristyToursCatalog] = useState<Providers.Toristy.CatalogGroup[]>(initialCatalog);
  const [loadingToristyTourCatalog, setLoadingToristyTourCatalog] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (toristyProducts) {
      setLoadingToristyTourCatalog(true);
      const newCatalog: Providers.Toristy.CatalogGroup[] = helper.deepCopy(initialCatalog);

      toristyProducts.forEach((product) => {
        if (!product.categories || !Array.isArray(product.categories)) return;

        let matched = false;

        // Check each catalog group in order, break after the first match
        for (const catalog of newCatalog) {
          if (product.categories.some((category) => catalog.parentTagIds.includes(Number(category.categoryid)))) {
            catalog.items.push(product);
            matched = true;
            break; // Exit loop after adding to the first matching catalog
          }
        }

        // If no catalog matched, add to 'Others'
        if (!matched) {
          const othersCatalog = newCatalog.find((catalog) => catalog.title === "Others");
          if (othersCatalog) {
            othersCatalog.items.push(product);
          }
        }
      });

      setToristyToursCatalog(newCatalog);
      setLoadingToristyTourCatalog(false);
    }
  }, [toristyProducts]);

  useEffect(() => {
    if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.TORISTY) && providers.toristy && cityId && window.tconfig.SHOW_TOURS_AND_TICKETS) {
      setLoadingToristyTourCatalog(true);
      providers.toristy
        .serviceList(cityId)
        .then((products: Providers.Toristy.Product[]) => {
          // const uniqueProducts = products.filter(
          //   (product, index, self) =>
          //     product.name !== undefined &&
          //     product.image?.orig !== undefined &&
          //     index === self.findIndex((p) => p.name === product.name && p.starting_price === product.starting_price)
          // );
          setToristyProducts(products);
        })
        .catch((viatorFetchToursError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "ToristyFetchToursError", viatorFetchToursError));
          setLoadingToristyTourCatalog(false);
        })
        .finally(() => setLoadingToristyTourCatalog(false));
    }
  }, [cityId, dispatch]);

  return {
    toristyToursCatalog,
    loadingToristyTourCatalog,
  };
};

export default useToristyCatalog;
