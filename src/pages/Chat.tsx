import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeftOpen } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { SourcesPanel } from "@/components/SourcesPanel";
import { HeaderControls } from "@/components/HeaderControls";
import { BrandMark } from "@/components/BrandMark";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";
import { useUiStore } from "@/store/uiStore";
import { useLocale } from "@/hooks/useLocale";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const {
    messages,
    streaming,
    webSearching,
    streamError,
    notFound,
    selectConversation,
    sendMessage,
    newConversation,
    clearError,
  } = useChatStore((s) => ({
    messages: s.messages,
    streaming: s.streaming,
    webSearching: s.webSearching,
    streamError: s.streamError,
    notFound: s.notFound,
    selectConversation: s.selectConversation,
    sendMessage: s.sendMessage,
    newConversation: s.newConversation,
    clearError: s.clearError,
  }));

  const { selectedKey, load: loadModels } = useModelStore((s) => ({
    selectedKey: s.selectedKey,
    load: s.load,
  }));
  const {
    sidebarCollapsed,
    toggleSidebar,
    openMobileNav,
    webSearchEnabled,
    sourcesPanelOpen,
    sourcesPanelSources,
    closeSourcesPanel,
  } = useUiStore((s) => ({
    sidebarCollapsed: s.sidebarCollapsed,
    toggleSidebar: s.toggleSidebar,
    openMobileNav: s.openMobileNav,
    webSearchEnabled: s.webSearchEnabled,
    sourcesPanelOpen: s.sourcesPanelOpen,
    sourcesPanelSources: s.sourcesPanelSources,
    closeSourcesPanel: s.closeSourcesPanel,
  }));

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (id) selectConversation(id);
  }, [id, selectConversation]);

  useEffect(() => {
    closeSourcesPanel();
  }, [id, closeSourcesPanel]);

  // If the requested conversation doesn't exist (404), bounce to /chat.
  useEffect(() => {
    if (notFound) {
      navigate("/chat", { replace: true });
    }
  }, [notFound, navigate]);

  // When the URL is /chat (no id), make sure we're showing a fresh empty
  // state instead of the last conversation's messages.
  useEffect(() => {
    if (!id) {
      // Clear active conversation + messages without touching the list.
      const { activeId } = useChatStore.getState();
      if (activeId !== null || messages.length > 0) {
        useChatStore.setState({ activeId: null, messages: [], notFound: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    function onSuggest(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) void handleSend(detail);
    }
    window.addEventListener("maisha:suggest", onSuggest);
    return () => window.removeEventListener("maisha:suggest", onSuggest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  async function handleSend(text: string) {
    if (!selectedKey) return;
    clearError();
    if (!id) {
      const convo = await newConversation(selectedKey);
      navigate(`/c/${convo.id}`, { replace: true });
      await sendMessage(text, selectedKey, { webSearch: webSearchEnabled });
      return;
    }
    await sendMessage(text, selectedKey, { webSearch: webSearchEnabled });
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex h-full min-w-0 flex-1">
        <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/70 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openMobileNav}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label={t("sidebar.expand")}
              title={t("sidebar.expand")}
            >
              <PanelLeftOpen size={16} />
            </button>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden h-9 w-9 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:grid dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label={t("sidebar.expand")}
                title={t("sidebar.expand")}
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <BrandMark size="sm" />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <HeaderControls />
            <ProfileMenu />
          </div>
        </header>
        {streamError && (
          <div className="border-b border-brand-200 bg-brand-50 px-4 py-2 text-center text-xs text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
            {streamError}
          </div>
        )}
        <main className="min-h-0 flex-1">
          <ChatWindow messages={messages} streaming={streaming} />
        </main>
        <ChatInput
          onSend={handleSend}
          disabled={streaming || !selectedKey}
          streaming={streaming}
          webSearching={webSearching}
        />
        </div>
        {sourcesPanelOpen && sourcesPanelSources.length > 0 && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              aria-label={t("chat.closeSources")}
              onClick={closeSourcesPanel}
            />
            <SourcesPanel sources={sourcesPanelSources} onClose={closeSourcesPanel} />
          </>
        )}
      </div>
    </div>
  );
}
