"use client";

import { useState } from "react";
import { useScenarioPlayer } from "@/hooks/use-scenario-player";
import { ChatComposer } from "./chat/chat-composer";
import { ChatHeader } from "./chat/chat-header";
import { MessageList } from "./chat/message-list";
import { OperatorSidebar } from "./operator/operator-sidebar";
import { ScenarioBar } from "./scenario-bar";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function ConversationWorkspace() {
  const player = useScenarioPlayer();

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
        <ChatHeader
          status={player.state.status}
          isPanelOpen={isPanelOpen}
          isMobilePanelOpen={isMobilePanelOpen}
          onTogglePanel={togglePanel}
        />
        <ScenarioBar
          scenarios={player.scenarios}
          activeId={player.scenario.id}
          stepIndex={player.stepIndex}
          totalSteps={player.totalSteps}
          onSelect={player.selectScenario}
        />
        <MessageList messages={player.state.messages} />
        <ChatComposer
          isFinished={player.isFinished}
          onNext={player.next}
          onReset={player.reset}
        />
      </main>

      <OperatorSidebar
        state={player.state}
        isOpen={isPanelOpen}
        isMobileOpen={isMobilePanelOpen}
        onClose={closePanel}
      />
    </div>
  );
}
