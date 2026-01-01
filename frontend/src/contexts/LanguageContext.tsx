import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import i18n from "../i18n";

export type Lang = "vi" | "jp";

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Lang>("jp"); // Default JP

    useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
