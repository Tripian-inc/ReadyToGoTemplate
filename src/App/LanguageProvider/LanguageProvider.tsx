import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { api } from "@tripian/core";
import moment from "moment";

const changeMomentLocale = async (newLocale: string) => {
  try {
    const localeCode = newLocale === "en" ? "en-gb" : newLocale;
    await import(`moment/locale/${localeCode}`);
    moment.locale(localeCode);
  } catch (error) {
    console.error(`Failed to load locale file for ${newLocale}:`, error);
  }
};

type LanguageContextType = {
  langCode: string;
  onSelectedLangCode: (langCode: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getLocalData } = useLocalStorage<string>("language", true);

  const [langCode, setLangCode] = useState<string>(getLocalData() || "en");

  useEffect(() => {
    changeMomentLocale(langCode);
  }, [langCode]);

  const onSelectedLangCode = async (langCode: string) => {
    localStorage.setItem("language", langCode);
    await changeMomentLocale(langCode);
    window.twindow.langCode = langCode;
    setLangCode(langCode);
    api.setLang(langCode);
  };

  const value: LanguageContextType = {
    langCode,
    onSelectedLangCode,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
