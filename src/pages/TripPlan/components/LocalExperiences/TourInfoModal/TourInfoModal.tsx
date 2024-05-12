import React from "react";
import Model, { Providers } from "@tripian/model";
import { BbTourInfo, /* GygTourInfo, */ Modal, PreLoading, CloseIconButton } from "@tripian/react";

import classes from "./TourInfoModal.module.scss";
import { GygLoader } from "../../../../../hooks/useGygApi";

interface ITourInfoModal {
  gygClose: () => void;

  bbClose: () => void;
  /* fetchBbTourInfo: (offerKey: string) => void; */
  adultCount: number;
  childrenCount?: number;
  gygTourState: {
    tour?: Providers.Gyg.Tour | undefined;
  };

  bbTourState: {
    product?: Providers.Bb.Product;
    activityInfo?: Providers.Bb.ActivityInfo;
  };
  tourInfoShowLoading: { show: boolean; loading: boolean };
  tripCurrentDate: string;
  tripReference: Model.TripReference | undefined;
  gygTourOptionDetails?: Providers.Gyg.TourOptionDetails[];
  gygBookingInfo?: Providers.Gyg.TourBooking;
  gygPaymentClick?: (data: Providers.Gyg.TourShoppingFormData) => void;
  gygLoaders?: GygLoader;
  gygBookingClick?: (booking: Providers.Gyg.TourBookingRequest) => void;
  fetchGygTourOptionsWithDetails?: (date: string, adult: number, tourId: number, children?: number) => void;
  user?: Model.User;
  t: (value: Model.TranslationKey) => string;
}

const TourInfoModal: React.FC<ITourInfoModal> = ({
  gygClose,

  bbClose,
  /* fetchBbTourInfo, */
  adultCount,
  childrenCount,
  gygTourState,

  tourInfoShowLoading,
  bbTourState,
  tripCurrentDate,
  tripReference,
  gygTourOptionDetails,
  gygBookingInfo,
  gygPaymentClick,
  gygLoaders,
  gygBookingClick,
  fetchGygTourOptionsWithDetails,
  user,
  t,
}) => {
  // GYG

  /* if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.GYG)) {
    return (
      <Modal show={tourInfoShowLoading.show} className="scrollable-y" backdropClick={gygClose}>
        {!tourInfoShowLoading.loading && gygTourState.tour ? (
          <GygTourInfo
            tour={gygTourState.tour}
            close={gygClose}
            initialDate={tripCurrentDate}
            adultCount={adultCount}
            childrenCount={childrenCount}
            tourOptionDetails={gygTourOptionDetails}
            tourInfoFormCallback={(date: string, adult: number, tourId: number, children?: number | undefined) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              fetchGygTourOptionsWithDetails ? fetchGygTourOptionsWithDetails(date, adult, tourId, children) : {};
            }}
            bookingClick={(booking: Providers.Gyg.TourBookingRequest) => (gygBookingClick ? gygBookingClick(booking) : {})}
            bookingInfo={gygBookingInfo}
            paymentClick={(data: Providers.Gyg.TourShoppingFormData) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              gygPaymentClick ? gygPaymentClick(data) : {};
            }}
            loading={gygLoaders?.tourDetailsLoader || gygLoaders?.bookingLoader || gygLoaders?.paymentLoader}
            startDate={tripReference?.tripProfile.arrivalDatetime || ""}
            endDate={tripReference?.tripProfile.departureDatetime || ""}
            user={user}
          />
        ) : (
          <div className={classes.tourInfoModalPageLoading}>
            <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
          </div>
        )}
      </Modal>
    );
  } */

  if (window.tconfig.TOUR_TICKET_PROVIDER_IDS.includes(Model.PROVIDER_ID.BOOK_BARBADOS)) {
    if (bbTourState.product) {
      return (
        <Modal show={tourInfoShowLoading.show} className="scrollable-y" backdropClick={bbClose}>
          {!tourInfoShowLoading.loading && bbTourState.product && bbTourState.activityInfo && tripCurrentDate && tripReference ? (
            <BbTourInfo
              product={bbTourState.product}
              activityInfo={bbTourState.activityInfo}
              tripProfile={tripReference.tripProfile}
              tripCurrentDate={tripCurrentDate}
              close={bbClose}
              onBookNow={(bbUrl) => {
                window.open(bbUrl);
              }}
              t={t}
            />
          ) : (
            <div className={classes.tourInfoModalPageLoading}>
              <PreLoading bgColor="rgba(238, 238, 238, 0.8)" />
            </div>
          )}
        </Modal>
      );
    } else {
      return (
        <Modal show={tourInfoShowLoading.show} backdropClick={bbClose}>
          <div className="row pt4">
            <div className={classes.tourInfoModalClose}>
              <CloseIconButton fill="#fff" clicked={bbClose} />
            </div>
            <div className={classes.tourInfoModalNoTours}>Tour date has passed.</div>
          </div>
        </Modal>
      );
    }
  }

  return null;
};

export default TourInfoModal;
