import { Check } from "lucide-react";
import { STAGES, type ConversationStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StageTrackerProps {
  current: ConversationStage | null;
  completed: ConversationStage[];
}

export function StageTracker({ current, completed }: StageTrackerProps) {
  return (
    <ol className="flex flex-wrap gap-1.5">
      {STAGES.map((stage) => {
        const isCurrent = stage.id === current;
        const isDone = completed.includes(stage.id) && !isCurrent;

        return (
          <li
            key={stage.id}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
              isCurrent && "bg-accent-soft font-medium text-accent-foreground",
              isDone && "bg-surface-muted text-foreground",
              !isCurrent && !isDone && "bg-surface-muted text-muted",
            )}
          >
            {isDone && <Check className="size-3" aria-hidden />}
            {stage.label}
          </li>
        );
      })}
    </ol>
  );
}
