import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));
  const { theme, toggle } = useTheme();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = (user?.display_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white dark:bg-zinc-200 dark:text-zinc-900"
        aria-label="Profile menu"
      >
        {initials || <UserRound size={14} />}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user?.display_name}
            </div>
            <div className="truncate text-xs text-zinc-500">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? t("profile.switchThemeLight") : t("profile.switchThemeDark")}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40"
          >
            <LogOut size={14} />
            {t("profile.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
