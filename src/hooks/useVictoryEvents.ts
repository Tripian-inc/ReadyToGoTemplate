import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { helper, Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";
import moment from "moment";

const initialCatalog: Providers.Victory.CatalogGroup[] = [{ title: "Events", items: [], parentTagIds: [] }];

const useVictoryEvents = (lat?: number, lon?: number, arrivalDate?: string, departureDate?: string) => {
  const [victoryEvents, setVictoryEvents] = useState<Providers.Victory.Event[]>([]);
  const [victoryEventsCatalog, setVictoryEventsCatalog] = useState(initialCatalog);
  const [loadingVictoryEventCatalog, setLoadingVictoryEventCatalog] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (victoryEvents) {
      setLoadingVictoryEventCatalog(true);
      const newCatalog: Providers.Victory.CatalogGroup[] = helper.deepCopy(initialCatalog);

      const eventsCategoryIndex = newCatalog.findIndex((c) => c.title === "Events");
      if (eventsCategoryIndex > -1) {
        newCatalog[eventsCategoryIndex].items = [...victoryEvents];
      }

      setVictoryEventsCatalog(newCatalog);
      setLoadingVictoryEventCatalog(false);
    }
  }, [victoryEvents]);

  useEffect(() => {
    if (
      window.tconfig.TOUR_TICKET_PROVIDER_IDS.some((x) => x === Model.PROVIDER_ID.VICTORY) &&
      providers.victory &&
      lat &&
      lon &&
      arrivalDate &&
      departureDate &&
      window.tconfig.SHOW_TOURS_AND_TICKETS
    ) {
      const today = moment().startOf("day");
      // const tomorrow = moment(today).add(1, "days");

      const updatedArrivalDate = moment(arrivalDate).isBefore(today) ? today.format("YYYY-MM-DD") : moment(arrivalDate).format("YYYY-MM-DD");
      // const updatedDepartureDate = moment(departureDate).isBefore(today) ? tomorrow.format("YYYY-MM-DD") : moment(departureDate).format("YYYY-MM-DD");

      setLoadingVictoryEventCatalog(true);
      providers.victory
        .events(lat, lon, updatedArrivalDate)
        .then((events: Providers.Victory.Event[]) => {
          const filteredEvents = events.filter((e) => e.name !== undefined);
          setVictoryEvents(filteredEvents);
        })
        .catch((victoryFetchEventsError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "VictoryFetchEventsError", victoryFetchEventsError));
          setLoadingVictoryEventCatalog(false);
        })
        .finally(() => setLoadingVictoryEventCatalog(false));
    }
  }, [lat, lon, dispatch, arrivalDate, departureDate]);

  return {
    victoryEvents,
    victoryEventsCatalog,
    loadingVictoryEventCatalog,
  };
};

export default useVictoryEvents;
