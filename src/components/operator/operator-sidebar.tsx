import {
  BookOpen,
  ClipboardList,
  Route,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import type { ConversationState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EscalationList } from "./escalation-list";
import { KnowledgeHits } from "./knowledge-hits";
import { PanelSection } from "./panel-section";
import { StageTracker } from "./stage-tracker";
import { SummaryCard } from "./summary-card";
import { ToolCallLog } from "./tool-call-log";

interface OperatorSidebarProps {
  state: ConversationState;
  /** lg ve üzeri ekranlarda sidebar'ın açık olup olmadığı */
  isOpen: boolean;
  /** lg altı ekranlarda drawer'ın açık olup olmadığı */
  isMobileOpen: boolean;
  onClose: () => void;
}

function PanelContent({ state, onClose }: Pick<OperatorSidebarProps, "state" | "onClose">) {
  return (
    <div className="flex h-full w-[340px] max-w-[85vw] flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Operatör paneli</h2>
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

export function OperatorSidebar({ state, isOpen, isMobileOpen, onClose }: OperatorSidebarProps) {
  return (
    <>
      {/* Masaüstü: genişliği animasyonlu açılıp kapanan sidebar */}
      <aside
        aria-label="Operatör paneli"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "hidden shrink-0 overflow-hidden border-l border-border transition-[width] duration-300 ease-out lg:block",
          isOpen ? "w-[340px]" : "w-0 border-l-0",
        )}
      >
        <PanelContent state={state} onClose={onClose} />
      </aside>

      {/* Mobil: sağdan açılan drawer */}
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
          <PanelContent state={state} onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
