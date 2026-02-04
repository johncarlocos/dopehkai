import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh/translation.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            zh: { translation: zh }
        },
        lng: "zh", // Set default language to Traditional Chinese
        fallbackLng: {
            "zh-TW": ["zh"],
            "zh-HK": ["zh"],
            "zh-MO": ["zh"],
            default: ["zh"], // Default fallback to Traditional Chinese
        },
        supportedLngs: ["zh"],
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
