"use client";

import type Anthropic from "@anthropic-ai/sdk";
import { useCallback, useReducer, useRef, useState } from "react";
import type { ChatRequestBody, ChatStreamChunk } from "@/lib/chat-protocol";
import {
  conversationReducer,
  initialConversationState,
  type ConversationAction,
} from "@/lib/conversation-reducer";
import { GREETING } from "@/lib/knowledge";
import type { ConversationEvent } from "@/lib/types";

const GREETING_EVENTS: ConversationEvent[] = [
  { type: "stage", stage: "greeting" },
  { type: "message", role: "assistant", content: GREETING },
];

function startedState() {
  return conversationReducer(initialConversationState, {
    type: "apply",
    events: GREETING_EVENTS,
  });
}

async function* readChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as ChatStreamChunk;
    }
  }
  if (buffer.trim()) yield JSON.parse(buffer) as ChatStreamChunk;
}

export function useAssistantChat() {
  const [state, dispatch] = useReducer(conversationReducer, undefined, startedState);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const historyRef = useRef<Anthropic.MessageParam[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const apply = (events: ConversationEvent[]) =>
    dispatch({ type: "apply", events } satisfies ConversationAction);

  const send = useCallback(
    async (text: string) => {
      const userMessage = text.trim();
      if (!userMessage || isStreaming || state.status === "closed") return;

      setError(null);
      setIsStreaming(true);
      apply([{ type: "message", role: "user", content: userMessage }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: historyRef.current,
            userMessage,
          } satisfies ChatRequestBody),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Asistana ulaşılamadı.");
        }

        for await (const chunk of readChunks(response.body)) {
          if (chunk.kind === "event") apply([chunk.event]);
          else if (chunk.kind === "history") historyRef.current = [...historyRef.current, ...chunk.messages];
          else setError(chunk.message);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
        }
      } finally {
        apply([{ type: "assistant_done" }]);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, state.status],
  );

  const restart = useCallback(() => {
    abortRef.current?.abort();
    historyRef.current = [];
    setError(null);
    setIsStreaming(false);
    dispatch({ type: "reset" });
    dispatch({ type: "apply", events: GREETING_EVENTS });
  }, []);

  return { state, isStreaming, error, send, restart };
}
