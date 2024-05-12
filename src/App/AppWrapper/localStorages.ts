import Model from "@tripian/model";
import LOCAL_STORAGE_KEYS from "../../constants/LOCAL_STORAGE_KEYS";

export const clearLocalStorage = (): void => {
  const clearKeys = LOCAL_STORAGE_KEYS.CLEAR.split(",");
  clearKeys.forEach((clearKey) => {
    localStorage.removeItem(clearKey);
  });
};

export const getLocalStorageToken = (): Model.Token | undefined => {
  if (!window.tconfig.SAVE_SESSION) return undefined;
  try {
    const trptkn = localStorage.getItem(`${window.location.hostname}-${LOCAL_STORAGE_KEYS.TOKEN}`);
    if (trptkn) {
      const token: Model.Token = JSON.parse(trptkn) as Model.Token;
      return token;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const removeLocalStorageToken = () => {
  localStorage.removeItem(`${window.location.hostname}-${LOCAL_STORAGE_KEYS.TOKEN}`);
};

export const saveLocalStorageToken = (token: Model.Token) => {
  if (window.tconfig.SAVE_SESSION) localStorage.setItem(`${window.location.hostname}-${LOCAL_STORAGE_KEYS.TOKEN}`, JSON.stringify(token));
};
