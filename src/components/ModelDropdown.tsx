import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Cpu } from "lucide-react";
import clsx from "clsx";
import type { ModelInfo, ModelVariant } from "@/api/models";
import { useModelStore } from "@/store/modelStore";
import { useLocale } from "@/hooks/useLocale";
import { asArray } from "@/utils/array";
import { ModelVariantBadge } from "./ModelVariantBadge";

interface ModelDropdownProps {
  /** Open the menu above or below the trigger button. */
  direction?: "up" | "down";
}

function VariantBadge({
  variant,
  variantLabel,
  instructOnly,
}: {
  variant: ModelVariant;
  variantLabel: string;
  instructOnly?: boolean;
}) {
  return (
    <ModelVariantBadge variant={variant} label={variantLabel} instructOnly={instructOnly} />
  );
}

export function ModelDropdown({ direction = "down" }: ModelDropdownProps) {
  const {
    models,
    variants,
    selectedKey,
    selectedVariant,
    select,
    setVariant,
    load,
    visibleModels,
    currentModel,
  } = useModelStore((s) => ({
    models: s.models,
    variants: s.variants,
    selectedKey: s.selectedKey,
    selectedVariant: s.selectedVariant,
    select: s.select,
    setVariant: s.setVariant,
    load: s.load,
    visibleModels: s.visibleModels,
    currentModel: s.currentModel,
  }));
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const modelList = asArray<ModelInfo>(models);
  const current =
    (typeof currentModel === "function" ? currentModel() : undefined) ??
    modelList.find((m) => m.key === selectedKey) ??
    modelList[0];
  const shown = visibleModels();

  if (modelList.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400">
        <Cpu size={12} />
        {t("chat.loadingModels")}
      </span>
    );
  }

  const variantHelp =
    selectedVariant === "dpo"
      ? variants?.dpo_description
      : variants?.instruct_description;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Cpu size={12} className="text-brand-600" />
        <span className="max-w-[8rem] truncate sm:max-w-none">{current?.label ?? t("models.select")}</span>
        {current && (
          <VariantBadge
            variant={current.variant}
            variantLabel={current.variant_label}
            instructOnly={current.variant === "instruct" && !current.has_dpo}
          />
        )}
        <ChevronDown
          size={12}
          className={clsx(
            "transition",
            open && (direction === "up" ? "-rotate-180" : "rotate-180"),
          )}
        />
      </button>
      {open && (
        <div
          className={clsx(
            "absolute left-0 z-30 w-[22rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900 sm:w-96",
            direction === "up" ? "bottom-full mb-2" : "mt-2",
          )}
        >
          <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("models.chooseModel")}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(["instruct", "dpo"] as const).map((variant) => {
                const active = selectedVariant === variant;
                const label =
                  variant === "dpo"
                    ? variants?.dpo ?? t("models.variantDpo")
                    : variants?.instruct ?? t("models.variantInstruct");
                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setVariant(variant)}
                    className={clsx(
                      "rounded-md px-2 py-1.5 text-xs font-medium transition",
                      active
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {variantHelp && (
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {variantHelp}
              </p>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {shown.map((m) => {
              const active = m.key === selectedKey;
              const instructOnly = m.variant === "instruct" && !m.has_dpo;
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => {
                      select(m.key);
                      setOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      active && "bg-brand-50/60 dark:bg-brand-950/30",
                    )}
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      {active ? (
                        <Check size={14} className="text-brand-600" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {m.label}
                        </span>
                        <VariantBadge
                          variant={m.variant}
                          variantLabel={m.variant_label}
                          instructOnly={instructOnly}
                        />
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {m.description}
                      </div>
                      {instructOnly && selectedVariant === "dpo" && (
                        <div className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">
                          {t("models.noDpoYet")}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
