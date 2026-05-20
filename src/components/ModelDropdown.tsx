import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Cpu } from "lucide-react";
import clsx from "clsx";
import { useModelStore } from "@/store/modelStore";

interface ModelDropdownProps {
  /** Open the menu above or below the trigger button. */
  direction?: "up" | "down";
}

export function ModelDropdown({ direction = "down" }: ModelDropdownProps) {
  const { models, selectedKey, select, load } = useModelStore((s) => ({
    models: s.models,
    selectedKey: s.selectedKey,
    select: s.select,
    load: s.load,
  }));
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

  const current = models.find((m) => m.key === selectedKey) ?? models[0];

  if (models.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400">
        <Cpu size={12} />
        Loading models...
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Cpu size={12} className="text-brand-600" />
        <span>{current?.label ?? "Select model"}</span>
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
            "absolute left-0 z-30 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900",
            direction === "up" ? "bottom-full mb-2" : "mt-2",
          )}
        >
          <div className="border-b border-zinc-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            Choose a model
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {models.map((m) => {
              const active = m.key === selectedKey;
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
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {m.label}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {m.description}
                      </div>
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
