import { RotateCcw } from "lucide-react";
import type { Scenario } from "@/lib/mock-scenarios";
import { cn } from "@/lib/utils";

export type ConversationMode = "live" | "scenario";

const MODES: { id: ConversationMode; label: string }[] = [
  { id: "live", label: "Canlı" },
  { id: "scenario", label: "Senaryo" },
];

interface ConversationToolbarProps {
  mode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  onRestart: () => void;
  scenarios: Scenario[];
  activeScenarioId: string;
  stepIndex: number;
  totalSteps: number;
  onSelectScenario: (id: string) => void;
}

export function ConversationToolbar({
  mode,
  onModeChange,
  onRestart,
  scenarios,
  activeScenarioId,
  stepIndex,
  totalSteps,
  onSelectScenario,
}: ConversationToolbarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2">
      <div role="tablist" aria-label="Görüşme modu" className="flex shrink-0 rounded-md bg-surface-muted p-0.5">
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
          <span className="ml-auto shrink-0 pl-2 font-mono text-xs text-muted">
            {stepIndex}/{totalSteps}
          </span>
        </>
      ) : (
        <>
          <span className="shrink-0 text-xs text-muted">Asistanla gerçek zamanlı görüşme</span>
          <button
            type="button"
            onClick={onRestart}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Yeni görüşme
          </button>
        </>
      )}
    </div>
  );
}
