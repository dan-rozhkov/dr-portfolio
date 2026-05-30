import { createContext, useContext, type ReactNode } from "react";
import type { Lang } from "./translations";
import { t } from "./translations";

interface I18nContextValue {
  lang: Lang;
  t: (key: Parameters<typeof t>[1]) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (key) => t("en", key),
});

export function I18nProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ lang, t: (key) => t(lang, key) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLang(): Lang {
  return useContext(I18nContext).lang;
}
