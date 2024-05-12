import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Model from "@tripian/model";
import { api } from "@tripian/core";
import { saveNotification } from "../redux/action/user";

const useNotificationSettings = () => {
  const [loadingNotificationSettings, setLoadingNotificationSettings] = useState<boolean>(true);
  const [notificationSettings, setNotificationSettings] = useState<Model.NotificationSettings[]>([]);

  const [loadingNotificationSettingUpdates, setLoadingNotificationSettingUpdates] = useState<number[]>([]);

  const dispatch = useDispatch();

  const fetchNotificationsSettings = useCallback(() => {
    api
      .notificationsSettings()
      .then((data: Model.NotificationSettings[]) => {
        setNotificationSettings(data);
        return data;
      })
      .catch((dataError) => {
        dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "notificationsSettings", "Fetch Notification Settings", dataError));
        throw dataError;
      })
      .finally(() => {
        setLoadingNotificationSettings(false);
      });
  }, [dispatch]);

  useEffect(() => {
    fetchNotificationsSettings();
  }, [fetchNotificationsSettings]);

  const updateNotificationsSetting = useCallback(
    (id: number, checked: boolean) => {
      setLoadingNotificationSettingUpdates((prev) => [...prev, id]);
      api
        .notificationsUpdateSettings(id, checked)
        .then((data) => {
          setNotificationSettings(data);
        })
        .catch((dataError) => {
          dispatch(saveNotification(Model.NOTIFICATION_TYPE.ERROR, "updateNotificationsSetting", "Fetch Notification Settings", dataError));
          throw dataError;
        })
        .finally(() => {
          setLoadingNotificationSettingUpdates((prev) => prev.filter((x) => x !== id));
        });
    },
    [dispatch]
  );

  const isLoadingNotificationSettingUpdate = (id: number) => loadingNotificationSettingUpdates.includes(id);

  return { loadingNotificationSettings, notificationSettings, updateNotificationsSetting, isLoadingNotificationSettingUpdate };
};

export default useNotificationSettings;
