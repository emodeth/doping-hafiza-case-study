import type { ConversationEvent, ConversationState } from "./types";
import { createId } from "./utils";

export const initialConversationState: ConversationState = {
  status: "idle",
  stage: null,
  completedStages: [],
  messages: [],
  toolCalls: [],
  knowledgeHits: [],
  escalations: [],
  summary: null,
};

export type ConversationAction =
  | { type: "apply"; events: ConversationEvent[] }
  | { type: "reset" };

function applyEvent(
  state: ConversationState,
  event: ConversationEvent,
): ConversationState {
  switch (event.type) {
    case "message":
      return {
        ...state,
        status: state.status === "idle" ? "active" : state.status,
        messages: [
          ...state.messages,
          { id: createId("msg"), role: event.role, content: event.content },
        ],
      };

    case "assistant_delta": {
      const last = state.messages.at(-1);
      if (last?.role === "assistant" && last.pending) {
        return {
          ...state,
          messages: [
            ...state.messages.slice(0, -1),
            { ...last, content: last.content + event.text },
          ],
        };
      }
      return {
        ...state,
        status: state.status === "idle" ? "active" : state.status,
        messages: [
          ...state.messages,
          { id: createId("msg"), role: "assistant", content: event.text, pending: true },
        ],
      };
    }

    case "assistant_done": {
      const last = state.messages.at(-1);
      if (!last?.pending) return state;
      return {
        ...state,
        messages: [...state.messages.slice(0, -1), { ...last, pending: false }],
      };
    }

    case "stage": {
      if (state.stage === event.stage) return state;
      const completedStages =
        state.stage && !state.completedStages.includes(state.stage)
          ? [...state.completedStages, state.stage]
          : state.completedStages;
      return { ...state, stage: event.stage, completedStages };
    }

    case "tool_call":
      return {
        ...state,
        toolCalls: [
          ...state.toolCalls,
          {
            id: createId("tool"),
            name: event.name,
            args: event.args,
            result: event.result,
          },
        ],
      };

    case "knowledge":
      return {
        ...state,
        knowledgeHits: [
          ...state.knowledgeHits,
          { topic: event.topic, found: event.found },
        ],
      };

    case "escalation":
      return {
        ...state,
        escalations: [
          ...state.escalations,
          { id: createId("esc"), reason: event.reason, urgency: event.urgency },
        ],
      };

    case "summary":
      return {
        ...state,
        status: "closed",
        summary: event.summary,
        completedStages:
          state.stage && !state.completedStages.includes(state.stage)
            ? [...state.completedStages, state.stage]
            : state.completedStages,
      };
  }
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case "apply":
      return action.events.reduce(applyEvent, state);
    case "reset":
      return initialConversationState;
  }
}
