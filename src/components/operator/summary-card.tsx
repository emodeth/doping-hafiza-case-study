import type { ConversationSummary, InterestLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyHint } from "./panel-section";

const INTEREST: Record<InterestLevel, { label: string; className: string }> = {
  interested: {
    label: "İlgileniyor",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  maybe: {
    label: "Kararsız",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  callback: {
    label: "Sonra görüşülecek",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  not_interested: {
    label: "İlgilenmiyor",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

export function SummaryCard({ summary }: { summary: ConversationSummary | null }) {
  if (!summary) return <EmptyHint>Görüşme bitince oluşur</EmptyHint>;

  const interest = INTEREST[summary.interest];

  return (
    <dl className="space-y-2.5 text-xs leading-relaxed">
      <span className={cn("inline-block rounded-md px-2 py-1 font-medium", interest.className)}>
        {interest.label}
      </span>

      <Row label="Sorduğu sorular">
        {summary.questionsAsked.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-4">
            {summary.questionsAsked.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        ) : (
          "—"
        )}
      </Row>

      <Row label="Sonraki adım">
        {summary.nextStep}
        {summary.callbackTime && ` · ${summary.callbackTime}`}
      </Row>

      <Row label="İnsan yönetici gerekli mi?">
        {summary.needsHuman ? (
          <ul className="list-disc space-y-0.5 pl-4 text-red-700 dark:text-red-300">
            {summary.humanReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          "Hayır"
        )}
      </Row>

      <Row label="Notlar">{summary.notes}</Row>
    </dl>
  );
}
