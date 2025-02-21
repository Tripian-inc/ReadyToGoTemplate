/* eslint-disable react/require-default-props */

import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Notification } from "@tripian/react";
import Model from "@tripian/model";

import ICombinedState from "../../redux/model/ICombinedState";
import { hideNotification as hideNotificationUser } from "../../redux/action/user";
import { hideNotification as hideNotificationTrip } from "../../redux/action/trip";
import useTranslate from "../../hooks/useTranslate";

interface INotify {
  positionX?: "left" | "center" | "right";
  positionY?: "top" | "bottom";
}

const Notify: React.FC<INotify> = ({ positionX = "right", positionY = "top" }) => {
  const { userNotifications, tripNotifications } = useSelector((state: ICombinedState) => ({
    userNotifications: state.user.notifications,
    tripNotifications: state.trip.notifications,
  }));
  const dispatch = useDispatch();

  const { t } = useTranslate();

  const shownUserNotification = useMemo(() => userNotifications.find((notification) => notification.hide === false), [userNotifications]);

  const shownTripNotification = useMemo(() => tripNotifications.find((notification) => notification.hide === false), [tripNotifications]);

  let shownNotificationType: "userNotification" | "tripNotification" = "userNotification";
  let shownMessage: {
    id: number;
    type: Model.NOTIFICATION_TYPE;
    functionName: string;
    message: string;
    closeMs: number;
    hide: boolean;
  };

  if (shownUserNotification?.message) {
    shownNotificationType = "userNotification";
    shownMessage = shownUserNotification;
  } else if (shownTripNotification?.message) {
    shownNotificationType = "tripNotification";
    shownMessage = shownTripNotification;
  } else return null;

  const onClose = (id: number, notificationType: "userNotification" | "tripNotification") => {
    if (notificationType === "userNotification") dispatch(hideNotificationUser(id));
    else dispatch(hideNotificationTrip(id));
  };

  return (
    <>
      <Notification
        type={shownMessage.type}
        positionX={positionX}
        positionY={positionY}
        title={`${t(`${shownMessage.type}`)}`}
        // eslint-disable-next-line no-constant-condition
        message={typeof (shownMessage.message === "string") ? shownMessage.message : JSON.stringify(shownMessage.message)}
        onClose={() => {
          onClose(shownMessage?.id, shownNotificationType);
        }}
        closeMs={shownMessage.closeMs}
      />
    </>
  );
};

export default Notify;
