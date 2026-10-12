"use client";

import { useEffect, useRef, useState } from "react";
import { useAssistantChat } from "@/hooks/use-assistant-chat";
import { useScenarioPlayer } from "@/hooks/use-scenario-player";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { LiveComposer, ScenarioComposer } from "./chat/chat-composer";
import { MessageList } from "./chat/message-list";
import { ConversationToolbar, type ConversationMode } from "./conversation-toolbar";
import { OperatorSidebar } from "./operator/operator-sidebar";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function ConversationWorkspace() {
  const [mode, setMode] = useState<ConversationMode>("live");
  const live = useAssistantChat();
  const player = useScenarioPlayer();

  const state = mode === "live" ? live.state : player.state;
  const lastMessage = live.state.messages.at(-1);
  const isThinking =
    mode === "live" && live.isStreaming && !(lastMessage?.role === "assistant" && lastMessage.pending);

  // --- Ses ---
  const tts = useSpeechSynthesis();
  const stt = useSpeechRecognition({ onFinal: (transcript) => live.send(transcript) });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const spokenMessageIdRef = useRef<string | null>(null);

  const lastAssistantMessage = live.state.messages.findLast((m) => m.role === "assistant");

  // Sesli yanıt açıkken, stream'i biten her yeni asistan mesajı bir kez okunur.
  useEffect(() => {
    if (mode !== "live" || !isVoiceEnabled || !lastAssistantMessage || lastAssistantMessage.pending) return;
    if (spokenMessageIdRef.current === lastAssistantMessage.id) return;
    spokenMessageIdRef.current = lastAssistantMessage.id;
    tts.speak(lastAssistantMessage.content);
  }, [mode, isVoiceEnabled, lastAssistantMessage, tts]);

  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const enableVoice = () => {
    setIsVoiceEnabled(true);
    setVoiceNotice(
      tts.hasVoiceForLang()
        ? null
        : "Bu cihazda Türkçe ses bulunamadı, cevaplar varsayılan sesle okunacak. En doğal ses için Edge önerilir.",
    );
  };

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      tts.cancel();
      setIsVoiceEnabled(false);
      setVoiceNotice(null);
      return;
    }
    // Açılırken son mesajın okunması için işaret sıfırlanır (ör. karşılama mesajı).
    spokenMessageIdRef.current = null;
    enableVoice();
  };

  const startListening = () => {
    tts.cancel();
    if (!isVoiceEnabled && tts.isSupported) {
      // Mikrofonla konuşmaya başlayan kullanıcı sesli cevap bekler; ama şu an
      // ekrandaki mesaj, kullanıcı konuşurken okunmamalı.
      spokenMessageIdRef.current = lastAssistantMessage?.id ?? null;
      enableVoice();
    }
    stt.start();
  };

  const changeMode = (next: ConversationMode) => {
    tts.cancel();
    stt.stop();
    setMode(next);
  };

  const restartLive = () => {
    tts.cancel();
    live.restart();
  };

  // --- Operatör paneli ---
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
          onRestart={restartLive}
          scenarios={player.scenarios}
          activeScenarioId={player.scenario.id}
          stepIndex={player.stepIndex}
          totalSteps={player.totalSteps}
          onSelectScenario={player.selectScenario}
          isPanelOpen={isPanelOpen}
          isMobilePanelOpen={isMobilePanelOpen}
          onTogglePanel={togglePanel}
          voice={
            mode === "live" && tts.isSupported
              ? { enabled: isVoiceEnabled, isSpeaking: tts.isSpeaking, onToggle: toggleVoice }
              : undefined
          }
        />
        <MessageList
          key={mode}
          messages={state.messages}
          isThinking={isThinking}
          error={mode === "live" ? (live.error ?? stt.error) : null}
          notice={mode === "live" ? voiceNotice : null}
        />
        {mode === "live" ? (
          <LiveComposer
            isStreaming={live.isStreaming}
            isClosed={live.state.status === "closed"}
            speech={{
              isSupported: stt.isSupported,
              isListening: stt.isListening,
              interimTranscript: stt.interimTranscript,
              onStart: startListening,
              onStop: stt.stop,
            }}
            onSend={live.send}
            onRestart={restartLive}
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
