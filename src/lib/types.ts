export type ConversationStage =
  | "greeting"
  | "availability"
  | "pitch"
  | "qa"
  | "scheduling"
  | "closed";

export const STAGES: { id: ConversationStage; label: string }[] = [
  { id: "greeting", label: "Tanışma" },
  { id: "availability", label: "Uygunluk" },
  { id: "pitch", label: "Proje" },
  { id: "qa", label: "Sorular" },
  { id: "scheduling", label: "Planlama" },
  { id: "closed", label: "Kapanış" },
];

export type MessageRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** Asistan mesajı hâlâ stream ediliyorsa true */
  pending?: boolean;
}

export type ToolName =
  | "lookup_info"
  | "escalate_to_human"
  | "propose_callback"
  | "end_conversation";

export interface ToolCall {
  id: string;
  name: ToolName;
  args: Record<string, unknown>;
  result?: string;
}

export interface KnowledgeHit {
  topic: string;
  found: boolean;
}

export type EscalationUrgency = "low" | "medium" | "high";

export interface Escalation {
  id: string;
  reason: string;
  urgency: EscalationUrgency;
}

export type InterestLevel =
  | "interested"
  | "maybe"
  | "callback"
  | "not_interested";

export interface ConversationSummary {
  interest: InterestLevel;
  questionsAsked: string[];
  nextStep: string;
  callbackTime?: string;
  needsHuman: boolean;
  humanReasons: string[];
  notes: string;
}

/**
 * Asistanın bir turunda üretilebilecek yan etkiler.
 * Mock senaryolar ve ileride gerçek LLM stream'i aynı event'leri üretir,
 * böylece UI hangi kaynaktan beslendiğini bilmek zorunda kalmaz.
 */
export type ConversationEvent =
  | { type: "message"; role: MessageRole; content: string }
  | { type: "assistant_delta"; text: string }
  | { type: "assistant_done" }
  | { type: "stage"; stage: ConversationStage }
  | { type: "tool_call"; name: ToolName; args: Record<string, unknown>; result?: string }
  | { type: "knowledge"; topic: string; found: boolean }
  | { type: "escalation"; reason: string; urgency: EscalationUrgency }
  | { type: "summary"; summary: ConversationSummary };

export type ConversationStatus = "idle" | "active" | "closed";

export interface ConversationState {
  status: ConversationStatus;
  stage: ConversationStage | null;
  completedStages: ConversationStage[];
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  knowledgeHits: KnowledgeHit[];
  escalations: Escalation[];
  summary: ConversationSummary | null;
}
