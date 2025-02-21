import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useVictoryInfo = () => {
  const [loadingVictoryInfo, setLoadingVictoryInfo] = useState<boolean>(false);
  const [victoryInfo, setVictoryInfo] = useState<{ info: Providers.Victory.EventDetail; venue: Providers.Victory.Venue; tickets?: Providers.Victory.TicketGroup[] }>();

  const dispatch = useDispatch();

  const fetchVictoryInfo = useCallback(
    async (id: string): Promise<boolean> => {
      if (providers.victory && window.tconfig.SHOW_TOURS_AND_TICKETS) {
        setLoadingVictoryInfo(true);
        setVictoryInfo(undefined);

        try {
          const eventData = await providers.victory.eventDetails(id);
          const venueData = await providers.victory.venue(eventData.venue.id.toString());
          const listTicketGroup = await providers.victory.listTicketGroups(id);
          const filteredTicketGroup = listTicketGroup.ticket_groups.filter((t) => t.eticket === true);
          // const ticketInfo = await providers.victory.ticketInfo(filteredTicketGroup[0].id.toString());
          // const clientRes = await providers.victory.clientsCreate(client);
          setVictoryInfo({ info: eventData, venue: venueData, tickets: filteredTicketGroup });
          return true;
        } catch (error) {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "victoryFetchTourError", error as any));
          return false;
        } finally {
          setLoadingVictoryInfo(false);
        }
      }
      return false;
    },
    [dispatch]
  );

  return {
    fetchVictoryInfo,
    loadingVictoryInfo,
    victoryInfo,
  };
};

export default useVictoryInfo;
