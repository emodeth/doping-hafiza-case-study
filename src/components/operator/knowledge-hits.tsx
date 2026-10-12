import type { KnowledgeHit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyHint } from "./panel-section";

export function KnowledgeHits({ hits }: { hits: KnowledgeHit[] }) {
  if (hits.length === 0) return <EmptyHint>Henüz bilgi kullanılmadı</EmptyHint>;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {hits.map((hit, i) => (
        <li
          key={`${hit.topic}-${i}`}
          title={hit.found ? "Bilgi tabanında bulundu" : "Bilgi tabanında yok"}
          className={cn(
            "rounded-md px-2 py-1 font-mono text-[11px]",
            hit.found
              ? "bg-surface-muted text-foreground"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          )}
        >
          {hit.topic}
          {!hit.found && " · yok"}
        </li>
      ))}
    </ul>
  );
}
