import { PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import { ASSISTANT } from "@/lib/knowledge";
import type { ConversationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ConversationStatus, string> = {
  idle: "Hazır",
  active: "Görüşmede",
  closed: "Kapandı",
};

const STATUS_STYLE: Record<ConversationStatus, string> = {
  idle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  active: "bg-accent-soft text-accent-foreground",
  closed: "bg-surface-muted text-muted",
};

interface ChatHeaderProps {
  status: ConversationStatus;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

export function ChatHeader({
  status,
  isPanelOpen,
  onTogglePanel,
}: ChatHeaderProps) {
  const ToggleIcon = isPanelOpen ? PanelRightClose : PanelRightOpen;

  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-foreground">
        <Sparkles className="size-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{ASSISTANT.name}</p>
        <p className="truncate text-xs text-muted">
          {ASSISTANT.role} · {ASSISTANT.projectName}
        </p>
      </div>

      <span
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium",
          STATUS_STYLE[status],
        )}
      >
        {STATUS_LABEL[status]}
      </span>

      <button
        type="button"
        onClick={onTogglePanel}
        aria-label={isPanelOpen ? "Operatör panelini kapat" : "Operatör panelini aç"}
        title={isPanelOpen ? "Operatör panelini kapat" : "Operatör panelini aç"}
        className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <ToggleIcon className="size-4" aria-hidden />
      </button>
    </header>
  );
}
