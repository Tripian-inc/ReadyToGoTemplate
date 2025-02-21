import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";
import moment from "moment";

const initialCatalog: Providers.Viator.CatalogGroup[] = [
  { title: "Adventure", items: [], parentTagIds: [22046] },
  { title: "Food", items: [], parentTagIds: [21482, 12208, 12694, 12713, 13285, 13288, 16548, 20245, 21482, 21567, 21911] },
  { title: "Culture and History", items: [], parentTagIds: [21479, 21511, 21517, 21910] },
  { title: "Sightseeing", items: [], parentTagIds: [11926, 11941, 12989, 20241, 21725, 21729, 21913] },
  { title: "Art and Museums", items: [], parentTagIds: [10847, 12716, 13109, 21514] },
  { title: "Local and Neighborhood", items: [], parentTagIds: [11265, 12208, 21754] },
  { title: "Others", items: [], parentTagIds: [] },
];

const useViatorCatalog = (cityName?: string, arrivalDatetime?: string, departureDatetime?: string) => {
  const [viatorProducts, setViatorProducts] = useState<Providers.Viator.Product[]>();
  const [viatorToursCatalog, setViatorToursCatalog] = useState(initialCatalog);
  const [loadingViatorTourCatalog, setLoadingViatorTourCatalog] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (viatorProducts) {
      setLoadingViatorTourCatalog(true);
      const newCatalog: Providers.Viator.CatalogGroup[] = helper.deepCopy(initialCatalog);
      let includes = false;
      viatorProducts.forEach((p) => {
        for (let catalogElement = 0; catalogElement < newCatalog.length; catalogElement++) {
          includes = false;
          for (let i = 0; i < p.tags.length; i++) {
            const tag = p.tags[i];
            if (newCatalog[catalogElement].parentTagIds.includes(tag)) {
              includes = true;
              break;
            }
          }

          if (includes) {
            newCatalog[catalogElement].items.push(p);
            break;
          }
        }

        if (!includes) newCatalog[newCatalog.length - 1].items.push(p);
      });

      setViatorToursCatalog(newCatalog);
      setLoadingViatorTourCatalog(false);
    }
  }, [viatorProducts]);

  useEffect(() => {
    if (
      window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VIATOR) &&
      providers.viator &&
      cityName &&
      arrivalDatetime &&
      departureDatetime &&
      window.tconfig.SHOW_TOURS_AND_TICKETS
    ) {
      const today = moment().startOf("day");
      const tomorrow = moment(today).add(1, "days");

      const updatedArrivalDatetime = moment(arrivalDatetime).isBefore(today) ? today.format("YYYY-MM-DD") : moment(arrivalDatetime).format("YYYY-MM-DD");
      const updatedDepartureDatetime = moment(departureDatetime).isBefore(today) ? tomorrow.format("YYYY-MM-DD") : moment(departureDatetime).format("YYYY-MM-DD");

      setLoadingViatorTourCatalog(true);
      providers.viator
        .products(cityName, updatedArrivalDatetime, updatedDepartureDatetime)
        .then((products: Providers.Viator.Product[]) => {
          setViatorProducts(products);
        })
        .catch((viatorFetchToursError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "ViatorFetchToursError", viatorFetchToursError));
          setLoadingViatorTourCatalog(false);
        })
        .finally(() => setLoadingViatorTourCatalog(false));
    }
  }, [arrivalDatetime, cityName, departureDatetime, dispatch]);

  return {
    viatorToursCatalog,
    loadingViatorTourCatalog,
  };
};

export default useViatorCatalog;
