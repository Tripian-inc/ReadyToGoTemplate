import Model from "@tripian/model";
import { RatingStars } from "@tripian/react";
import React, { useMemo } from "react";

interface ITourTicketCard {
  bookingProduct: Model.BookingProduct;
  clicked: (productId: string) => void;
  t: (value: Model.TranslationKey) => string;
}

const TourTicketCard: React.FC<ITourTicketCard> = ({ bookingProduct, clicked, t }) => {
  const priceSymbol = useMemo(() => {
    if (bookingProduct.currency === "USD") {
      return "$";
    }

    if (bookingProduct.currency === "EUR") {
      return "€";
    }

    return `${bookingProduct.currency || ""} `;
  }, [bookingProduct.currency]);
  return (
    <div className="relative w-[354px] h-[360px] bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img src={bookingProduct.image || ""} alt="Tour" className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-bold tracking-wide">{bookingProduct.provider}</div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{bookingProduct.title}</h3>

        {bookingProduct.rating && bookingProduct.rating > 3.6 && bookingProduct.ratingCount && bookingProduct.ratingCount > 9 ? (
          <div className="flex items-center mb-2">
            <RatingStars rating={(bookingProduct?.rating * 20).toString()} />
            <span>&nbsp;({bookingProduct.ratingCount})</span>
          </div>
        ) : null}

        <div className="flex justify-between items-center absolute bottom-4 left-4 right-4 w-[calc(100% - 2rem)]">
          <div>
            <span className="text-lg font-bold">
              {priceSymbol}
              {bookingProduct.price}
            </span>
            <span className="text-sm text-gray-600"> {t("trips.myTrips.localExperiences.tourDetails.experience.perPerson")}</span>
          </div>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => clicked(bookingProduct.id.toString())}>
            {t("trips.myTrips.localExperiences.tourDetails.bookNow")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourTicketCard;
