import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PanelLeftOpen } from "lucide-react";
import { voiceTranscribe } from "@/api/voice";
import { Sidebar } from "@/components/Sidebar";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { SourcesPanel } from "@/components/SourcesPanel";
import { HeaderControls } from "@/components/HeaderControls";
import { BrandMark } from "@/components/BrandMark";
import { ChatExportMenu } from "@/components/ChatExportMenu";
import { KnowledgePanel } from "@/components/KnowledgePanel";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";
import { useUiStore } from "@/store/uiStore";
import { useLocale } from "@/hooks/useLocale";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightMessageId = Number(searchParams.get("msg")) || null;
  const clearedHighlightRef = useRef<number | null>(null);
  const { t } = useLocale();
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voicePrefill, setVoicePrefill] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [knowledgeLayoutTick, setKnowledgeLayoutTick] = useState(0);
  const { recording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const {
    messages,
    streaming,
    webSearching,
    knowledgeSearching,
    streamError,
    notFound,
    activeId,
    conversations,
    selectConversation,
    sendMessage,
    clearError,
    stopGeneration,
  } = useChatStore((s) => ({
    messages: s.messages,
    streaming: s.streaming,
    webSearching: s.webSearching,
    knowledgeSearching: s.knowledgeSearching,
    streamError: s.streamError,
    notFound: s.notFound,
    activeId: s.activeId,
    conversations: s.conversations,
    selectConversation: s.selectConversation,
    sendMessage: s.sendMessage,
    clearError: s.clearError,
    stopGeneration: s.stopGeneration,
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
    knowledgeEnabled,
    knowledgePanelOpen,
    setKnowledgePanelOpen,
    sourcesPanelOpen,
    sourcesPanelSources,
    closeSourcesPanel,
  } = useUiStore((s) => ({
    sidebarCollapsed: s.sidebarCollapsed,
    toggleSidebar: s.toggleSidebar,
    openMobileNav: s.openMobileNav,
    webSearchEnabled: s.webSearchEnabled,
    knowledgeEnabled: s.knowledgeEnabled,
    knowledgePanelOpen: s.knowledgePanelOpen,
    setKnowledgePanelOpen: s.setKnowledgePanelOpen,
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

  useEffect(() => {
    if (!highlightMessageId || clearedHighlightRef.current === highlightMessageId) return;
    const timer = window.setTimeout(() => {
      clearedHighlightRef.current = highlightMessageId;
      const next = new URLSearchParams(searchParams);
      next.delete("msg");
      setSearchParams(next, { replace: true });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [highlightMessageId, searchParams, setSearchParams, messages.length]);

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
    setVoiceNotice(null);
    const convoId = await sendMessage(text, selectedKey, {
      webSearch: webSearchEnabled,
      useKnowledge: knowledgeEnabled,
    });
    if (!id && convoId) {
      navigate(`/c/${convoId}`, { replace: true });
    }
  }

  async function handleVoiceToggle() {
    if (!selectedKey || streaming || voiceProcessing) return;
    clearError();
    setVoiceNotice(null);

    if (!recording) {
      try {
        await startRecording();
      } catch {
        useChatStore.setState({ streamError: t("chat.voiceMicDenied") });
      }
      return;
    }

    setVoiceProcessing(true);
    try {
      const blob = await stopRecording();
      const result = await voiceTranscribe(blob);
      const transcript = result.text_sukuma.trim();
      if (!transcript) {
        useChatStore.setState({ streamError: t("chat.voiceEmpty") });
        return;
      }
      setVoicePrefill(transcript);
      setVoiceNotice(t("chat.voiceComingSoon"));
    } catch (e: any) {
      useChatStore.setState({
        streamError: e?.message ?? t("chat.voiceFailed"),
      });
    } finally {
      setVoiceProcessing(false);
    }
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
            <ChatExportMenu
              messages={messages}
              activeId={activeId ?? id ?? null}
              conversations={conversations}
              modelKey={selectedKey}
              disabled={streaming}
            />
            <HeaderControls />
            <ProfileMenu />
          </div>
        </header>
        {streamError && (
          <div className="border-b border-brand-200 bg-brand-50 px-4 py-2 text-center text-xs text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
            {streamError}
          </div>
        )}
        {voiceNotice && (
          <div className="border-b border-violet-200 bg-violet-50 px-4 py-2.5 text-center text-xs text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
            {voiceNotice}
          </div>
        )}
        <main className="min-h-0 flex-1">
          <ChatWindow
            messages={messages}
            streaming={streaming}
            highlightMessageId={highlightMessageId}
            knowledgePanelOpen={knowledgePanelOpen}
            knowledgeLayoutTick={knowledgeLayoutTick}
          />
        </main>
        <footer className="shrink-0">
          <KnowledgePanel
            open={knowledgePanelOpen}
            onClose={() => setKnowledgePanelOpen(false)}
            conversationId={activeId ?? id ?? null}
            onLayoutChange={() => setKnowledgeLayoutTick((n) => n + 1)}
          />
          <ChatInput
            onSend={handleSend}
            onStop={stopGeneration}
            onVoiceToggle={handleVoiceToggle}
            onOpenKnowledge={() => setKnowledgePanelOpen(!knowledgePanelOpen)}
            knowledgePanelOpen={knowledgePanelOpen}
            voiceRecording={recording}
            voiceProcessing={voiceProcessing}
            knowledgeSearching={knowledgeSearching}
            prefillText={voicePrefill}
            onPrefillApplied={() => setVoicePrefill(null)}
            disabled={voiceProcessing || !selectedKey}
            streaming={streaming}
            webSearching={webSearching}
          />
        </footer>
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
