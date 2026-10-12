import { PanelRightClose, PanelRightOpen, RotateCcw } from "lucide-react";
import type { Scenario } from "@/lib/mock-scenarios";
import type { ConversationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ConversationMode = "live" | "scenario";

const MODES: { id: ConversationMode; label: string }[] = [
  { id: "live", label: "Canlı" },
  { id: "scenario", label: "Senaryo" },
];

interface ConversationToolbarProps {
  mode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  status: ConversationStatus;
  onRestart: () => void;
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  isPanelOpen: boolean;
  isMobilePanelOpen: boolean;
  onTogglePanel: () => void;
}

export function ConversationToolbar({
  mode,
  onModeChange,
  status,
  onRestart,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  isPanelOpen,
  isMobilePanelOpen,
  onTogglePanel,
}: ConversationToolbarProps) {
  const DesktopIcon = isPanelOpen ? PanelRightClose : PanelRightOpen;
  const MobileIcon = isMobilePanelOpen ? PanelRightClose : PanelRightOpen;

  return (
    <header className="flex items-center gap-2 border-b border-border px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Görüşme modu"
          className="flex shrink-0 rounded-md bg-surface-muted p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => onModeChange(m.id)}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition-colors",
                mode === m.id
                  ? "bg-surface font-medium text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />

        {mode === "scenario" ? (
          <>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelectScenario(scenario.id)}
                aria-label={`${scenario.label}: ${scenario.description}`}
                className={cn(
                  "shrink-0 rounded-md border px-2.5 py-1 text-xs transition-colors",
                  scenario.id === activeScenarioId
                    ? "border-accent bg-accent-soft text-accent-foreground"
                    : "border-border text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {scenario.label}
              </button>
            ))}
          </>
        ) : (
          <>
            <span className="shrink-0 text-xs text-muted">Asistanla gerçek zamanlı görüşme</span>
            {status !== "closed" && (
              <button
                type="button"
                onClick={onRestart}
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Yeni görüşme
              </button>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onTogglePanel}
        aria-label="Operatör panelini aç/kapat"
        title="Operatör paneli"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <DesktopIcon className="hidden size-4 lg:block" aria-hidden />
        <MobileIcon className="size-4 lg:hidden" aria-hidden />
      </button>
    </header>
  );
}
