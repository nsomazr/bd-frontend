import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BrainCog,
  Calendar,
  Droplet,
  HeartPulse,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  Stethoscope,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { HeaderControls } from "@/components/HeaderControls";
import { useAuthStore } from "@/store/authStore";
import { useLocale } from "@/hooks/useLocale";
import type { TranslationKey } from "@/i18n/translations";

const FEATURE_ICONS = [Stethoscope, MapPin, Calendar, Activity, HeartPulse, Users];
const STEP_ICONS = [MessageCircle, BrainCog, Send];
const ARENA_STEP_ICONS = [MessageCircle, ShieldCheck, Trophy];
const MODEL_NAMES = ["Gemma 4 E4B", "Qwen 3.5 4B", "Llama 3.2 3B"];

function NavBar() {
  const status = useAuthStore((s) => s.status);
  const authed = status === "authenticated";
  const ready = status !== "idle" && status !== "loading";
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "#features", label: t("nav.features") },
    { href: "#how", label: t("nav.how") },
    { href: "#models", label: t("nav.models") },
    { href: "#arena", label: t("nav.arena") },
    { href: "#faq", label: t("nav.faq") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link to="/" className="flex min-w-0 shrink items-center">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:flex lg:gap-7">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-zinc-900 dark:hover:text-white">
              {label}
            </a>
          ))}
          <Link to="/leaderboard" className="hover:text-zinc-900 dark:hover:text-white">
            {t("sidebar.leaderboard")}
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderControls />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {!ready ? (
            <div className="hidden h-9 w-24 animate-pulse rounded-lg bg-zinc-200/70 sm:block dark:bg-zinc-800/70" />
          ) : authed ? (
            <Link
              to="/chat"
              className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-flex"
            >
              <span className="hidden sm:inline">{t("nav.goToChat")}</span>
              <span className="sm:hidden">Chat</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 md:inline-flex"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:px-3.5"
              >
                <span className="hidden sm:inline">{t("nav.getStarted")}</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-zinc-200 px-3 py-3 lg:hidden dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {label}
              </a>
            ))}
            <Link
              to="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {t("sidebar.leaderboard")}
            </Link>
            {!authed && ready && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const status = useAuthStore((s) => s.status);
  const authed = status === "authenticated";
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            color: "#dc2626",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-3 pb-16 pt-12 sm:px-4 sm:pb-20 sm:pt-16 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-6xl dark:text-white">
              {t("landing.heroTitleStart")}{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                {t("landing.heroTitleHighlight")}
              </span>{" "}
              {t("landing.heroTitleEnd")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:mt-5 sm:text-lg dark:text-zinc-300">
              <span className="font-semibold">{t("app.name")}</span>{" "}
              {t("landing.heroBodyRest")}
            </p>

            <div className="mt-6 sm:mt-8">
              <Link
                to={authed ? "/chat" : "/signup"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 sm:w-auto"
              >
                {authed ? t("landing.ctaContinue") : t("landing.ctaStartFree")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative min-w-0">
            <HeroChatMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroChatMock() {
  const { t } = useLocale();
  const bullets = [
    t("landing.mockBullet1"),
    t("landing.mockBullet2"),
    t("landing.mockBullet3"),
    t("landing.mockBullet4"),
  ];

  return (
    <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-2xl shadow-brand-900/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <BrainCog size={12} className="text-brand-600" />
          Gemma 4 E4B
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900">
            {t("landing.mockQuestion")}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Droplet size={14} fill="currentColor" />
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-zinc-100 px-3.5 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
            <p>{t("landing.mockAnswerIntro")}</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-zinc-700 dark:text-zinc-300">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">
              {t("landing.mockAnswerOutro")}
              <span className="ml-0.5 inline-block h-3.5 w-[2px] -mb-0.5 animate-blink-caret bg-brand-500 align-middle" />
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <input
          type="text"
          disabled
          placeholder={t("landing.mockPlaceholder")}
          className="flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
        />
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"
          aria-label={t("chat.send")}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function Stats() {
  const { t } = useLocale();
  const stats = [
    { value: t("landing.stat1.value"), label: t("landing.stat1.label") },
    { value: t("landing.stat2.value"), label: t("landing.stat2.label") },
    { value: t("landing.stat3.value"), label: t("landing.stat3.label") },
  ];

  return (
    <section className="border-y border-zinc-200/70 bg-zinc-50/60 py-10 dark:border-zinc-800/70 dark:bg-zinc-900/40">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-brand-600 sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">{body}</p>
      )}
    </div>
  );
}

function featureKey(n: number, field: "title" | "body"): TranslationKey {
  return `landing.feature${n}.${field}` as TranslationKey;
}

function Features() {
  const { t } = useLocale();

  return (
    <section id="features" className="py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <SectionHeader
          eyebrow={t("landing.featuresEyebrow")}
          title={t("landing.featuresTitle")}
          body={t("landing.featuresBody")}
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ICONS.map((Icon, idx) => {
            const n = idx + 1;
            const title = t(featureKey(n, "title"));
            return (
              <div
                key={title}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-200/60 transition group-hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-900/50">
                  <Icon size={20} />
                </div>
                <div className="text-base font-semibold text-zinc-900 dark:text-white">
                  {title}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t(featureKey(n, "body"))}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function stepKey(n: number, field: "title" | "body"): TranslationKey {
  return `landing.step${n}.${field}` as TranslationKey;
}

function HowItWorks() {
  const { t } = useLocale();

  return (
    <section id="how" className="bg-zinc-50/60 py-20 sm:py-24 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow={t("landing.howEyebrow")}
          title={t("landing.howTitle")}
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEP_ICONS.map((Icon, idx) => {
            const n = idx + 1;
            const title = t(stepKey(n, "title"));
            return (
              <div
                key={title}
                className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="absolute -top-3 left-6 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <Icon size={20} />
                </div>
                <div className="text-base font-semibold text-zinc-900 dark:text-white">
                  {title}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t(stepKey(n, "body"))}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function modelKey(n: number, field: "tagline" | "body"): TranslationKey {
  return `landing.model${n}.${field}` as TranslationKey;
}

function arenaStepKey(n: number, field: "title" | "body"): TranslationKey {
  return `landing.arenaStep${n}.${field}` as TranslationKey;
}

function ArenaSection() {
  const status = useAuthStore((s) => s.status);
  const authed = status === "authenticated";
  const { t } = useLocale();

  return (
    <section id="arena" className="bg-zinc-50/60 py-20 sm:py-24 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow={t("landing.arenaEyebrow")}
          title={t("landing.arenaTitle")}
          body={t("landing.arenaBody")}
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {ARENA_STEP_ICONS.map((Icon, idx) => {
            const n = idx + 1;
            const title = t(arenaStepKey(n, "title"));
            return (
              <div
                key={title}
                className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="absolute -top-3 left-6 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <Icon size={20} />
                </div>
                <div className="text-base font-semibold text-zinc-900 dark:text-white">
                  {title}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t(arenaStepKey(n, "body"))}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={authed ? "/arena" : "/signup"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            <Trophy size={16} />
            {t("landing.arenaCtaTry")}
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Award size={16} />
            {t("landing.arenaCtaLeaderboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Models() {
  const { t } = useLocale();

  return (
    <section id="models" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow={t("landing.modelsEyebrow")}
          title={t("landing.modelsTitle")}
          body={t("landing.modelsBody")}
        />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {MODEL_NAMES.map((name, idx) => {
            const n = idx + 1;
            return (
              <div
                key={name}
                className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  <BrainCog size={12} />
                  {t(modelKey(n, "tagline"))}
                </div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {name}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t(modelKey(n, "body"))}
                </p>
                <div className="absolute -bottom-12 -right-12 grid h-32 w-32 place-items-center rounded-full bg-brand-500/10">
                  <Droplet
                    size={48}
                    className="text-brand-500/40"
                    fill="currentColor"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function faqKey(n: number, field: "q" | "a"): TranslationKey {
  return `landing.faq${n}.${field}` as TranslationKey;
}

function FAQ() {
  const { t } = useLocale();
  const faqs = [1, 2, 3, 4].map((n) => ({
    q: t(faqKey(n, "q")),
    a: t(faqKey(n, "a")),
  }));

  return (
    <section id="faq" className="bg-zinc-50/60 py-20 sm:py-24 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader eyebrow={t("landing.faqEyebrow")} title={t("landing.faqTitle")} />
        <div className="mt-10 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-zinc-900 dark:text-white">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition group-open:rotate-45 dark:bg-zinc-800 dark:text-zinc-300">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const status = useAuthStore((s) => s.status);
  const authed = status === "authenticated";
  const { t } = useLocale();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute inset-0 -z-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("landing.ctaTitle")}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                {t("landing.ctaBody")}
              </p>
            </div>
            <Link
              to={authed ? "/chat" : "/signup"}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              {authed ? t("landing.ctaChat") : t("landing.ctaStart")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-zinc-200/70 bg-white py-10 dark:border-zinc-800/70 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-3 text-sm text-zinc-500 sm:flex-row sm:px-4">
        <div className="flex items-center gap-2">
          <BrandMark size="sm" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-5">
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("nav.features")}
          </a>
          <a href="#models" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("nav.models")}
          </a>
          <a href="#arena" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("nav.arena")}
          </a>
          <Link to="/leaderboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("sidebar.leaderboard")}
          </Link>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("nav.faq")}
          </a>
          <Link to="/login" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t("nav.signIn")}
          </Link>
        </div>
        <div className="text-xs">
          &copy; {new Date().getFullYear()} {t("app.name")}. {t("landing.footerBuilt")}
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <NavBar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Models />
        <ArenaSection />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
