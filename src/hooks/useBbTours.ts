import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { useDispatch } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";
import { barbadosCities } from "../demo/barbadosCities";

const initialCatalog: Providers.Bb.CatalogGroup[] = [
  {
    title: "Adventure",
    items: [],
    themes: [
      Providers.Bb.ACTIVITY_THEMES.SOFT_ADVENTURE,
      Providers.Bb.ACTIVITY_THEMES.ON_THE_WATER,
      Providers.Bb.ACTIVITY_THEMES.UNDER_WATER,
      Providers.Bb.ACTIVITY_THEMES.UNDER_GROUND,
    ],
  },
  { title: "Food", items: [], themes: [Providers.Bb.ACTIVITY_THEMES.FOODIE_DELIGHTS] },
  {
    title: "Culture and History",
    items: [],
    themes: [Providers.Bb.ACTIVITY_THEMES.HISTORY, Providers.Bb.ACTIVITY_THEMES.ART_AND_CULTURE, Providers.Bb.ACTIVITY_THEMES.VOLUNTOURISM],
  },
  { title: "Sightseeing", items: [], themes: [Providers.Bb.ACTIVITY_THEMES.FAMILY_FUN, Providers.Bb.ACTIVITY_THEMES.ON_THE_LAND, Providers.Bb.ACTIVITY_THEMES.SHORE_EXCURSIONS] },
  { title: "Art and Museums", items: [], themes: [Providers.Bb.ACTIVITY_THEMES.ART_AND_CULTURE] },
  { title: "Local and Neighborhood", items: [], themes: [Providers.Bb.ACTIVITY_THEMES.VOLUNTOURISM] },
];

const useBbTours = (cityId?: number, arrivalDatetime?: string, departureDatetime?: string) => {
  const [loadingBbTourCatalog, setLoadingBbTourCatalog] = useState<boolean>(true);
  const [loadingBbTourInfo, setLoadingBbTourInfo] = useState<boolean>(false);
  const [bbTours, setBbTours] = useState<Providers.Bb.Product[]>();
  const [bbToursCatalog, setBbToursCatalog] = useState(initialCatalog);
  const [bbActivityInfo, setBbActivityInfo] = useState<Providers.Bb.ActivityInfo>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (bbTours) {
      const newCatalog: Providers.Bb.CatalogGroup[] = helper.deepCopy(initialCatalog);
      /**
       *
       * Adventure                =>    Soft Adventure, On the Water, Under Water, Underground
       * Food                     =>    Foodie Delights
       * Culture and History      =>    History, Arts & Culture, Voluntourism
       * Sightseeing              =>    Family and Fun, On the Land, Shore Excursions
       * Art and Museums          =>    Arts & Culture
       * Local and Neighborhood   =>    Voluntourism
       */

      /*
       *
       * TODO
       *
       */
      bbTours.forEach((t) => {
        if (t.themes && t.themes.length > 0) {
          newCatalog.forEach((c) => {
            if (c.themes.includes(t.themes[0])) {
              c.items.push(t);
            }
          });
        }
      });

      setBbToursCatalog(newCatalog);
    }
  }, [bbTours]);

  useEffect(() => {
    if (cityId && arrivalDatetime && departureDatetime && window.tconfig.SHOW_TOURS_AND_TICKETS) {
      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.BOOK_BARBADOS)) {
        const isBarbadosCity = barbadosCities.findIndex((bc) => bc === cityId);

        if (isBarbadosCity > -1) {
          providers.bb
            ?.searchActivities(moment(arrivalDatetime).format("YYYY-MM-DD") || "", moment(departureDatetime).format("YYYY-MM-DD") || "")
            .then((searchActivitiesResponse: Providers.Bb.SearchActivitiesResponse) => {
              setBbTours(searchActivitiesResponse.products);
            })
            .catch((bbFetchToursError) => {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "BBFetchToursError", "Book Barbados Fetch Tours", bbFetchToursError));
            })
            .finally(() => {
              setLoadingBbTourCatalog(false);
            });
        } else {
          setLoadingBbTourCatalog(false);
        }
      } else {
        setLoadingBbTourCatalog(false);
      }
    }
  }, [arrivalDatetime, cityId, departureDatetime, dispatch]);

  const fetchTourInfo = useCallback(
    (bookingId: string, isLoadingActive = true) => {
      setLoadingBbTourInfo(false);

      if (isLoadingActive) setLoadingBbTourInfo(true);

      if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.BOOK_BARBADOS)) {
        if (providers.bb) {
          setBbActivityInfo(undefined);

          return providers.bb
            .activityInfo(bookingId)
            .then((ai: Providers.Bb.ActivityInfo) => {
              setBbActivityInfo(ai);

              return true;
            })
            .catch((bbFetchActivityError) => {
              dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "bbFetchTourError", "Book Barbados Fetch Activity Info", bbFetchActivityError));
              // throw gygFetchTourError;
              return false;
            })
            .finally(() => {
              setLoadingBbTourInfo(false);
            });
        }

        // return Promise.resolve(true);
      }

      return Promise.resolve(true);
    },
    [dispatch]
  );

  return { bbActivityInfo, bbToursCatalog, fetchTourInfo, loadingBbTourCatalog, loadingBbTourInfo };
};

export default useBbTours;
