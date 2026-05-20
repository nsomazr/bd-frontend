import { Globe2 } from "lucide-react";
import clsx from "clsx";
import { useLocale } from "@/hooks/useLocale";

export function LanguageToggle() {
  const { lang, toggleLang, t } = useLocale();
  const nextLang = lang === "en" ? "sw" : "en";

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
      aria-label={nextLang === "sw" ? t("lang.switchToSw") : t("lang.switchToEn")}
      title={nextLang === "sw" ? t("lang.switchToSw") : t("lang.switchToEn")}
    >
      <Globe2 size={14} className="opacity-70" />
      <span className="inline-flex overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
        <span
          className={clsx(
            "px-1.5 py-0.5",
            lang === "en"
              ? "bg-brand-600 text-white"
              : "bg-transparent text-zinc-500 dark:text-zinc-400",
          )}
        >
          {t("lang.en")}
        </span>
        <span
          className={clsx(
            "px-1.5 py-0.5",
            lang === "sw"
              ? "bg-brand-600 text-white"
              : "bg-transparent text-zinc-500 dark:text-zinc-400",
          )}
        >
          {t("lang.sw")}
        </span>
      </span>
    </button>
  );
}
