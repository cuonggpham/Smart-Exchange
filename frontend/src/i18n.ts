import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import vi from "./locales/vi.json";
import jp from "./locales/jp.json";

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: vi },
            jp: { translation: jp },
        },
        fallbackLng: "vi",
        supportedLngs: ["vi", "jp"],
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
