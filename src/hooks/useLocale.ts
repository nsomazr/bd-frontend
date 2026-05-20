import { useMemo } from "react";
import { type TranslationKey, translate } from "@/i18n/translations";
import { useLocaleStore } from "@/store/localeStore";

export function useLocale() {
  const lang = useLocaleStore((s) => s.lang);
  const setLang = useLocaleStore((s) => s.setLang);
  const toggleLang = useLocaleStore((s) => s.toggleLang);

  const t = useMemo(
    () => (key: TranslationKey) => translate(lang, key),
    [lang],
  );

  return { lang, setLang, toggleLang, t };
}

export type { Lang } from "@/i18n/translations";
