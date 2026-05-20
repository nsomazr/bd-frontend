import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { HeaderControls } from "@/components/HeaderControls";
import { useAuthStore } from "@/store/authStore";
import { useLocale } from "@/hooks/useLocale";

export default function LoginPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { login, status, error } = useAuthStore((s) => ({
    login: s.login,
    status: s.status,
    error: s.error,
  }));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/chat" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/chat", { replace: true });
    } catch {
      // store sets error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-gradient-to-br from-zinc-50 to-brand-50 px-4 py-10 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute right-4 top-4">
        <HeaderControls />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="lg" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
            {t("auth.welcomeBack")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("auth.email")}
            </span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("auth.password")}
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 pr-10 text-sm shadow-sm placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 grid w-10 place-items-center text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {submitting ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("auth.newHere")}{" "}
          <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
