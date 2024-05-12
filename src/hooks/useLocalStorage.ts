import { helper } from "@tripian/model";

export const useLocalStorage = <T>(k: string, exact = false) => {
  const getLocalData = (): T | undefined => {
    const value = localStorage.getItem(k);
    if (exact === true) return value?.toString() as T;
    return value !== null ? JSON.parse(value) : undefined;
  };

  const setLocalData = (value: T) => {
    if (exact === true) localStorage.setItem(k, (value as any).toString());
    localStorage.setItem(k, JSON.stringify(value));
    if (k === "theme") helper.setTheme(value as unknown as string, window.tconfig.THEME);
  };

  const clearLocalData = () => {
    localStorage.removeItem(k);
  };

  return { getLocalData, setLocalData, clearLocalData };
};
