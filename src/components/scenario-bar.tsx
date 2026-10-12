import type { Scenario } from "@/lib/mock-scenarios";
import { cn } from "@/lib/utils";

interface ScenarioBarProps {
  scenarios: Scenario[];
  activeId: string;
  stepIndex: number;
  totalSteps: number;
  onSelect: (id: string) => void;
}

export function ScenarioBar({
  scenarios,
  activeId,
  stepIndex,
  totalSteps,
  onSelect,
}: ScenarioBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2">
      <span className="shrink-0 text-xs text-muted">Senaryo</span>
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          onClick={() => onSelect(scenario.id)}
          title={scenario.description}
          className={cn(
            "shrink-0 rounded-md border px-2.5 py-1 text-xs transition-colors",
            scenario.id === activeId
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
    </div>
  );
}
