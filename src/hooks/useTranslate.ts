import Model from "@tripian/model";
import { useLanguage } from "../App/LanguageProvider/LanguageProvider";

const useTranslate = () => {
  const { langCode, onSelectedLangCode } = useLanguage();

  const t = (key: Model.TranslationKey): string => {
    if (window.tconfig.T.translations && window.tconfig.T.lang_codes) {
      return window.tconfig.T.translations[langCode].keys[key] || key;
    }
    return key;
  };

  return { t, langCode, onSelectedLangCode };
};

export default useTranslate;
