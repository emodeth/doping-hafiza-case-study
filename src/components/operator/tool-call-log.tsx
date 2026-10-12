import type { ToolCall } from "@/lib/types";
import { EmptyHint } from "./panel-section";

function formatArgs(args: Record<string, unknown>) {
  return Object.values(args)
    .map((value) => JSON.stringify(value))
    .join(", ");
}

export function ToolCallLog({ calls }: { calls: ToolCall[] }) {
  if (calls.length === 0) return <EmptyHint>Henüz tool çağrısı yok</EmptyHint>;

  return (
    <ol className="space-y-1 font-mono text-[11px] leading-relaxed">
      {calls.map((call) => (
        <li key={call.id} className="break-words text-muted">
          <span className="text-foreground">{call.name}</span>({formatArgs(call.args)})
          {call.result && <span> → {call.result}</span>}
        </li>
      ))}
    </ol>
  );
}
