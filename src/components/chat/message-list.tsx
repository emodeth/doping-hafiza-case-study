"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, TriangleAlert } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
  /** Asistan cevabı bekleniyor ama henüz metin gelmedi */
  isThinking?: boolean;
  error?: string | null;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="Asistan yazıyor">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface-muted px-4 py-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageList({ messages, isThinking, error }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastContentLength = messages.at(-1)?.content.length ?? 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, lastContentLength, isThinking, error]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <MessageCircle className="size-8 text-muted" aria-hidden />
        <p className="text-sm font-medium">Görüşme henüz başlamadı</p>
        <p className="max-w-xs text-sm text-muted">
          Yukarıdan bir senaryo seç veya &quot;İleri&quot; ile görüşmeyi başlat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isThinking && <TypingIndicator />}
        {error && (
          <div className="flex items-center gap-2 self-center rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
