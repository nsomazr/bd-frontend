import clsx from "clsx";
import { Cpu, Sparkles } from "lucide-react";
import type { ModelVariant } from "@/api/models";
import { useLocale } from "@/hooks/useLocale";

interface ModelVariantBadgeProps {
  variant: ModelVariant;
  label: string;
  instructOnly?: boolean;
  className?: string;
}

export function ModelVariantBadge({
  variant,
  label,
  instructOnly,
  className,
}: ModelVariantBadgeProps) {
  const { t } = useLocale();
  const isDpo = variant === "dpo";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isDpo
          ? "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
          : "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
        className,
      )}
    >
      {isDpo ? <Sparkles size={10} /> : <Cpu size={10} />}
      {instructOnly ? t("models.instructOnly") : label}
    </span>
  );
}
