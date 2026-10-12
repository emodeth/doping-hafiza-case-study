import {
  BookOpen,
  ClipboardList,
  Route,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import type { ConversationState, ConversationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EscalationList } from "./escalation-list";
import { KnowledgeHits } from "./knowledge-hits";
import { PanelSection } from "./panel-section";
import { StageTracker } from "./stage-tracker";
import { SummaryCard } from "./summary-card";
import { ToolCallLog } from "./tool-call-log";

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

interface OperatorSidebarProps {
  state: ConversationState;
  progress?: { current: number; total: number };
  isOpen: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
}

function PanelContent({
  state,
  progress,
  onClose,
}: Pick<OperatorSidebarProps, "state" | "progress" | "onClose">) {
  return (
    <div className="flex h-full w-[340px] max-w-[85vw] flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 className="mr-auto text-sm font-medium">Operatör paneli</h2>
        {progress && (
          <span className="font-mono text-xs text-muted">
            {progress.current}/{progress.total}
          </span>
        )}
        <span
          className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_STYLE[state.status])}
        >
          {STATUS_LABEL[state.status]}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Operatör panelini kapat"
          className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Aşama" icon={Route}>
          <StageTracker current={state.stage} completed={state.completedStages} />
        </PanelSection>
        <PanelSection title="Kullanılan bilgi" icon={BookOpen} count={state.knowledgeHits.length}>
          <KnowledgeHits hits={state.knowledgeHits} />
        </PanelSection>
        <PanelSection title="Tool çağrıları" icon={Wrench} count={state.toolCalls.length}>
          <ToolCallLog calls={state.toolCalls} />
        </PanelSection>
        <PanelSection title="İnsana devir" icon={TriangleAlert} count={state.escalations.length}>
          <EscalationList escalations={state.escalations} />
        </PanelSection>
        <PanelSection title="Görüşme özeti" icon={ClipboardList}>
          <SummaryCard summary={state.summary} />
        </PanelSection>
      </div>
    </div>
  );
}

export function OperatorSidebar({
  state,
  progress,
  isOpen,
  isMobileOpen,
  onClose,
}: OperatorSidebarProps) {
  return (
    <>
      <aside
        aria-label="Operatör paneli"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "hidden shrink-0 overflow-hidden border-l border-border transition-[width] duration-300 ease-out lg:block",
          isOpen ? "w-[340px]" : "w-0 border-l-0",
        )}
      >
        <PanelContent state={state} progress={progress} onClose={onClose} />
      </aside>

      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !isMobileOpen && "pointer-events-none")}
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="Operatör paneli"
          className={cn(
            "absolute inset-y-0 right-0 border-l border-border transition-transform duration-300 ease-out",
            isMobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <PanelContent state={state} progress={progress} onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
