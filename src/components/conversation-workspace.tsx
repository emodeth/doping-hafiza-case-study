"use client";

import { useState } from "react";
import { useAssistantChat } from "@/hooks/use-assistant-chat";
import { useScenarioPlayer } from "@/hooks/use-scenario-player";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { LiveComposer, ScenarioComposer } from "./chat/chat-composer";
import { MessageList } from "./chat/message-list";
import { ConversationToolbar, type ConversationMode } from "./conversation-toolbar";
import { OperatorSidebar } from "./operator/operator-sidebar";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function ConversationWorkspace() {
  const [mode, setMode] = useState<ConversationMode>("live");
  const live = useAssistantChat();
  const player = useScenarioPlayer();
  const speech = useSpeechRecognition({ onFinal: (transcript) => live.send(transcript) });

  const state = mode === "live" ? live.state : player.state;
  const lastMessage = live.state.messages.at(-1);
  const isThinking =
    mode === "live" && live.isStreaming && !(lastMessage?.role === "assistant" && lastMessage.pending);

  const changeMode = (next: ConversationMode) => {
    speech.stop();
    setMode(next);
  };

  // Masaüstü ve mobil için ayrı state: masaüstünde varsayılan açık,
  // mobilde chat'i kapatmaması için varsayılan kapalı.
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

  const togglePanel = () => {
    if (isDesktop()) setIsPanelOpen((open) => !open);
    else setIsMobilePanelOpen((open) => !open);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setIsMobilePanelOpen(false);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <main className="flex min-w-0 flex-1 flex-col bg-surface">
        <ConversationToolbar
          mode={mode}
          onModeChange={changeMode}
          status={state.status}
          onRestart={live.restart}
          scenarios={player.scenarios}
          activeScenarioId={player.scenario.id}
          stepIndex={player.stepIndex}
          totalSteps={player.totalSteps}
          onSelectScenario={player.selectScenario}
          isPanelOpen={isPanelOpen}
          isMobilePanelOpen={isMobilePanelOpen}
          onTogglePanel={togglePanel}
        />
        <MessageList
          key={mode}
          messages={state.messages}
          isThinking={isThinking}
          error={mode === "live" ? (live.error ?? speech.error) : null}
        />
        {mode === "live" ? (
          <LiveComposer
            isStreaming={live.isStreaming}
            isClosed={live.state.status === "closed"}
            speech={{
              isSupported: speech.isSupported,
              isListening: speech.isListening,
              interimTranscript: speech.interimTranscript,
              onStart: speech.start,
              onStop: speech.stop,
            }}
            onSend={live.send}
            onRestart={live.restart}
          />
        ) : (
          <ScenarioComposer
            isFinished={player.isFinished}
            onNext={player.next}
            onReset={player.reset}
          />
        )}
      </main>

      <OperatorSidebar
        state={state}
        isOpen={isPanelOpen}
        isMobileOpen={isMobilePanelOpen}
        onClose={closePanel}
      />
    </div>
  );
}
