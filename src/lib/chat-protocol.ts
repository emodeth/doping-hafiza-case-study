import type Anthropic from "@anthropic-ai/sdk";
import type { ConversationEvent } from "./types";

export interface ChatRequestBody {
  history: Anthropic.MessageParam[];
  userMessage: string;
}

export type ChatStreamChunk =
  | { kind: "event"; event: ConversationEvent }
  | { kind: "history"; messages: Anthropic.MessageParam[] }
  | { kind: "error"; message: string };
