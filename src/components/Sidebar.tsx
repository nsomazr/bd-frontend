import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  MessageSquare,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import type { ConversationSearchHit } from "@/api/chat";
import { BrandMark } from "./BrandMark";
import { ChatSearchBox } from "./ChatSearchBox";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";
import { useUiStore } from "@/store/uiStore";
import { useLocale } from "@/hooks/useLocale";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const activeIdParam = id ?? null;
  const { t } = useLocale();

  const {
    conversations,
    loadConversations,
    newConversation,
    removeConversation,
    activeId,
  } = useChatStore((s) => ({
    conversations: s.conversations,
    loadConversations: s.loadConversations,
    newConversation: s.newConversation,
    removeConversation: s.removeConversation,
    activeId: s.activeId,
  }));
  const selectedKey = useModelStore((s) => s.selectedKey);
  const { sidebarCollapsed: collapsed, mobileNavOpen, closeMobileNav, toggleSidebar } =
    useUiStore((s) => ({
      sidebarCollapsed: s.sidebarCollapsed,
      mobileNavOpen: s.mobileNavOpen,
      closeMobileNav: s.closeMobileNav,
      toggleSidebar: s.toggleSidebar,
    }));
  const status = useAuthStore((s) => s.status);
  const sessionReady = status === "authenticated" || status === "guest";
  const isStaff = useAuthStore((s) => Boolean(s.user?.is_staff));

  useEffect(() => {
    if (sessionReady) loadConversations();
  }, [sessionReady, loadConversations]);

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const showLabels = mobileNavOpen || !collapsed;

  async function handleNew() {
    if (!selectedKey) return;
    const c = await newConversation(selectedKey);
    closeMobileNav();
    navigate(`/c/${c.id}`);
  }

  async function handleDelete(e: React.MouseEvent, convoId: string) {
    e.preventDefault();
    e.stopPropagation();
    await removeConversation(convoId);
    if (activeIdParam === convoId) navigate("/chat");
  }

  function handleSearchSelect(hit: ConversationSearchHit) {
    closeMobileNav();
    const suffix = hit.message_id ? `?msg=${hit.message_id}` : "";
    navigate(`/c/${hit.conversation_id}${suffix}`);
  }

  const showRecentList = showLabels;

  return (
    <>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950",
          "md:relative md:z-auto md:translate-x-0",
          showLabels ? "w-[min(100vw-3rem,18rem)]" : "w-16",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div
          className={clsx(
            "flex items-center p-3",
            showLabels ? "justify-between px-4" : "justify-center",
          )}
        >
          {showLabels ? (
            <Link to="/" aria-label="Maisha home" onClick={closeMobileNav}>
              <BrandMark />
            </Link>
          ) : (
            <Link to="/" aria-label="Maisha home" onClick={closeMobileNav}>
              <BrandMark withText={false} />
            </Link>
          )}
          {showLabels && (
            <button
              type="button"
              onClick={() => (mobileNavOpen ? closeMobileNav() : toggleSidebar())}
              className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label={t("sidebar.collapse")}
              title={t("sidebar.collapse")}
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {!showLabels && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 max-md:hidden"
            aria-label={t("sidebar.expand")}
            title={t("sidebar.expand")}
          >
            <PanelLeftOpen size={16} />
          </button>
        )}

        <div className={clsx("px-3", !showLabels && "flex justify-center")}>
          {!showLabels ? (
            <button
              type="button"
              onClick={handleNew}
              className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white shadow-sm transition hover:bg-brand-700"
              aria-label={t("sidebar.newChat")}
              title={t("sidebar.newChat")}
            >
              <Plus size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNew}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Plus size={14} />
              {t("sidebar.newChat")}
            </button>
          )}
        </div>

        <div className={clsx("mt-3 space-y-1", !showLabels ? "px-1" : "px-2")}>
          {[
            { to: "/arena", label: t("sidebar.modelArena"), Icon: Trophy },
            { to: "/leaderboard", label: t("sidebar.leaderboard"), Icon: Award },
            ...(isStaff
              ? [{ to: "/admin", label: t("sidebar.admin"), Icon: ShieldCheck }]
              : []),
          ].map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            if (!showLabels) {
              return (
                <Link
                  key={to}
                  to={to}
                  title={label}
                  onClick={closeMobileNav}
                  className={clsx(
                    "mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition",
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                      : "text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
                  )}
                >
                  <Icon size={15} />
                </Link>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileNav}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
                )}
              >
                <Icon size={14} className="shrink-0 opacity-80" />
                <span className="flex-1 truncate font-medium">{label}</span>
              </Link>
            );
          })}
        </div>

        <nav
          className={clsx(
            "scrollbar-thin mt-3 flex min-h-0 flex-1 flex-col overflow-hidden pb-3",
            !showLabels ? "px-1" : "px-0",
          )}
        >
          {showLabels && (
            <ChatSearchBox onSelectHit={handleSearchSelect} />
          )}
          {showRecentList && (
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {t("sidebar.recent")}
            </div>
          )}
          <div
            className={clsx(
              "scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
              !showLabels ? "px-1" : "px-2",
            )}
          >
          {conversations.length === 0 ? (
            showLabels && (
              <div className="mx-2 mt-2 rounded-xl border border-dashed border-zinc-300 bg-white/40 p-4 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                  <MessagesSquare size={16} />
                </div>
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t("sidebar.noConversations")}
                </div>
              </div>
            )
          ) : (
            <ul className={clsx("space-y-0.5", !showLabels && "flex flex-col items-center")}>
              {conversations.map((c) => {
                const active = c.id === (activeIdParam ?? activeId);
                if (!showLabels) {
                  return (
                    <li key={c.id} className="w-full">
                      <Link
                        to={`/c/${c.id}`}
                        title={c.title || t("sidebar.untitled")}
                        onClick={closeMobileNav}
                        className={clsx(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition",
                          active
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                            : "text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
                        )}
                      >
                        <MessageSquare size={15} />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={c.id}>
                    <Link
                      to={`/c/${c.id}`}
                      onClick={closeMobileNav}
                      className={clsx(
                        "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
                      )}
                    >
                      <MessageSquare size={14} className="shrink-0 opacity-70" />
                      <span className="flex-1 truncate">{c.title || t("sidebar.untitled")}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, c.id)}
                        className="opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={13} className="text-zinc-400 hover:text-brand-600" />
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          </div>
        </nav>
      </aside>
    </>
  );
}
