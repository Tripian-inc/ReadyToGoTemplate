import React, { useEffect, useState } from "react";
import Model, { Providers } from "@tripian/model";
import moment from "moment";
import { useHistory } from "react-router";
import useVictoryInfo from "../../../hooks/useVictoryInfo";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import AppNav from "../../../App/AppNav/AppNav";
import { PreLoading, SvgIcons } from "@tripian/react";
import TicketModal from "./TicketModal/TicketModal";
import { TicketMap } from "@ticketevolution/seatmaps-client";

interface IVictoryProductInfo {
  productId: string;
  t: (value: Model.TranslationKey) => string;
}

const VictoryProductInfo: React.FC<IVictoryProductInfo> = ({ productId, t }) => {
  const { fetchVictoryInfo, victoryInfo, loadingVictoryInfo } = useVictoryInfo();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const history = useHistory();

  useEffect(() => {
    fetchVictoryInfo(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateStr: string) => moment(dateStr).format("ddd, MMM D, h:mm A");

  if (loadingVictoryInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (!victoryInfo || !victoryInfo.info) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">Your platform does not support "Victory" tours.</div>
      </>
    );
  }

  // const center = {
  //   lat: victoryInfo.info.venue.address.latitude,
  //   lng: victoryInfo.info.venue.address.longitude,
  // };

  const artists = victoryInfo.info.performances.map((pr) => (pr as unknown as Providers.Victory.Performance).performer?.name || "");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />

      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
        <button className="absolute z-10 top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" onClick={() => history.goBack()}>
          <SvgIcons.ArrowLeft className="w-6 h-6" />
        </button>
        <div className="h-64 bg-gradient-to-r from-primary-color to-warning-color flex items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-white text-center">{victoryInfo.info.name}</h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1">
                  <span className="text-gray-600">Theatre / </span>
                  <span>Entertainment Shows</span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date and Time</h3>
                <p className="mt-1">{formatDate(victoryInfo.info.occurs_at_local)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Place</h3>
                <p className="mt-1 font-medium">{victoryInfo.venue.name}</p>
                <p className="text-gray-600">
                  {victoryInfo.venue.address.street_address}
                  <br />
                  {victoryInfo.venue.address.location}, {victoryInfo.venue.address.postal_code}
                  <br />
                  {victoryInfo.venue.address.country_code}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Performers</h3>
                <div className="mt-1 space-y-1">
                  <p className="text-blue-600 font-medium">{artists.join(", ")}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Ticket</h3>
                <p className="mt-1">{victoryInfo.info.available_count}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg">
              {/* <GoogleMapsProductInfo center={center} zoom={15} /> */}
              <TicketMap
                venueId={victoryInfo.venue.id.toString()}
                configurationId={victoryInfo.info.configuration.id.toString()}
                ticketGroups={victoryInfo.tickets?.map((t) => ({ tevo_section_name: t.tevo_section_name, retail_price: t.retail_price }))}
                mapsDomain="https://maps-dev.ticketevolution.com"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 bg-primary-color text-white rounded-lg transition-colors flex items-center" onClick={() => setIsTicketModalOpen(true)}>
              <SvgIcons.Ticket2 className="w-5 h-5 mr-2" />
              Check Available Tickets
            </button>
          </div>
        </div>
      </div>
      {victoryInfo.tickets && victoryInfo.tickets.length > 0 ? (
        <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} tickets={victoryInfo.tickets} />
      ) : (
        <div>
          <span>Sorry. All tickets are sold out.</span>
        </div>
      )}
    </div>
  );
};

export default VictoryProductInfo;
