import React, { useState } from "react";
import { Providers } from "@tripian/model";
import { Backdrop, SvgIcons } from "@tripian/react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Providers.Victory.TicketGroup[];
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, tickets }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedTicket, setSelectedTicket] = useState<Providers.Victory.TicketGroup | null>(null);

  if (!isOpen) return null;

  const sortedTickets = [...tickets].sort((a, b) => a.retail_price - b.retail_price);

  const handlePurchase = () => {
    if (selectedTicket) {
      console.log("Purchase:", {
        ticketId: selectedTicket.id,
        quantity: selectedQuantity,
        total: selectedTicket.retail_price * selectedQuantity,
      });
    }
  };

  return (
    <>
      <Backdrop show={isOpen} clicked={() => onClose()} zIndex={9999} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-tr from-primary-color to-primary-color-300">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <SvgIcons.Ticket2 className="w-6 h-6 mr-2" />
              Select Tickets
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <SvgIcons.X fill="white" className="w-6 h-6" />
            </button>
          </div>

          {/* Ticket List */}
          <div className="overflow-y-auto flex-1 p-4">
            <div className="space-y-4">
              {sortedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id ? "border-primary-color-500 bg-primary-color-100" : "hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Section {ticket.section}, Row {ticket.row}
                      </h3>
                      <div className="space-y-1 mt-2 text-sm text-gray-600">
                        <p>Available: {ticket.available_quantity} tickets</p>
                        <p className="flex items-center">
                          <span className={ticket.eticket ? "text-green-600" : "text-gray-600"}>{ticket.format}</span>
                          {ticket.instant_delivery && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Instant Delivery</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-color">${ticket.retail_price.toFixed(2)}</p>
                      {ticket.face_value_display && <p className="text-sm text-gray-500">Face value: ${ticket.face_value_display.toFixed(2)}</p>}
                    </div>
                  </div>

                  {ticket.public_notes && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                      <SvgIcons.Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{ticket.public_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Section */}
          {selectedTicket && (
            <div className="border-t p-4 bg-secondary-color-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <select value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} className="border rounded px-2 py-1">
                    {selectedTicket.splits.map((split) => (
                      <option key={split} value={split}>
                        {split}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-primary-color">${(selectedTicket.retail_price * selectedQuantity).toFixed(2)}</p>
                </div>
              </div>
              <button onClick={handlePurchase} className="mt-4 w-full bg-primary-color-900 text-white py-3 rounded-lg font-medium hover:bg-primary-color transition-colors">
                Purchase Tickets
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TicketModal;
