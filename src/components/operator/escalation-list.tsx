import { TriangleAlert } from "lucide-react";
import type { Escalation, EscalationUrgency } from "@/lib/types";
import { EmptyHint } from "./panel-section";

const URGENCY_LABEL: Record<EscalationUrgency, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

export function EscalationList({ escalations }: { escalations: Escalation[] }) {
  if (escalations.length === 0) return <EmptyHint>Devir gerekmiyor</EmptyHint>;

  return (
    <ul className="space-y-1.5">
      {escalations.map((escalation) => (
        <li
          key={escalation.id}
          className="flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="flex-1 leading-snug">{escalation.reason}</span>
          <span className="shrink-0 font-medium">{URGENCY_LABEL[escalation.urgency]}</span>
        </li>
      ))}
    </ul>
  );
}
