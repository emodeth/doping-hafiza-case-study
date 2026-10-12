import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%]",
          isAssistant
            ? "rounded-bl-md bg-surface-muted text-foreground"
            : "rounded-br-md bg-accent text-white dark:text-zinc-950",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
