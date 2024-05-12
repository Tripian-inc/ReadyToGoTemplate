import React from "react";

import Model from "@tripian/model";
import { MustTryCard } from "@tripian/react";
import { api } from "@tripian/core";

import useTrip from "../../../../hooks/useTrip";
import useTranslate from "../../../../hooks/useTranslate";

interface IMustTryList {
  focus: (poi: Model.Poi) => void;
}

const MustTryList: React.FC<IMustTryList> = ({ focus }) => {
  const { tripReference } = useTrip();

  const { t } = useTranslate();

  const getPois = (tasteId: number): Promise<Model.Poi[]> => {
    const tastesIds: Array<number> = [];
    tastesIds[0] = tasteId;
    return api.poisMustTrySearch({ cityId: tripReference?.city.id || 0, mustTryIds: tastesIds.join(","), limit: 100 });
  };

  return (
    <>
      {tripReference
        ? tripReference.city.mustTries.map((taste) => (
            <div key={`taste-${taste.id}`}>
              <MustTryCard
                taste={taste}
                poiCardClicked={focus}
                fetchPois={getPois}
                hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
                hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
                hideOfferIcon={!window.tconfig.SHOW_OFFERS}
                TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
                TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
                RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
                t={t}
              />
            </div>
          ))
        : null}
    </>
  );
};

export default MustTryList;
