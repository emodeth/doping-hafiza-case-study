import "server-only";
import { lookupKnowledge } from "@/lib/knowledge";
import type { ConversationEvent, InterestLevel } from "@/lib/types";
import { isAssistantTool, toolInputSchemas } from "./tools";

const MOCK_CALLBACK_SLOTS = ["Yarın 11:00", "Yarın 16:00", "Perşembe 14:00"];

export interface ToolExecution {
  result: string;
  isError?: boolean;
  events: ConversationEvent[];
  outcome?: InterestLevel;
}

function error(message: string): ToolExecution {
  return { result: message, isError: true, events: [] };
}

export function executeTool(name: string, rawInput: unknown): ToolExecution {
  if (!isAssistantTool(name)) return error(`Bilinmeyen tool: ${name}`);

  switch (name) {
    case "set_stage": {
      const input = toolInputSchemas.set_stage.safeParse(rawInput);
      if (!input.success) return error("Geçersiz girdi");
      return {
        result: "ok",
        events: [{ type: "stage", stage: input.data.stage }],
      };
    }

    case "lookup_info": {
      const input = toolInputSchemas.lookup_info.safeParse(rawInput);
      if (!input.success) return error("Geçersiz girdi");
      const entry = lookupKnowledge(input.data.topic);
      const found = Boolean(entry);
      return {
        result: JSON.stringify(
          entry
            ? { found: true, title: entry.title, content: entry.content }
            : {
                found: false,
                note: "Bu konuda onaylı bilgi yok. Tahmin yürütme; bilmediğini söyle ve yöneticiye devret.",
              },
        ),
        events: [
          {
            type: "tool_call",
            name: "lookup_info",
            args: input.data,
            result: found ? "found" : "not_found",
          },
          { type: "knowledge", topic: input.data.topic, found },
        ],
      };
    }

    case "escalate_to_human": {
      const input = toolInputSchemas.escalate_to_human.safeParse(rawInput);
      if (!input.success) return error("Geçersiz girdi");
      return {
        result: "Devir kaydı oluşturuldu. Yönetici bu konuyla ilgilenecek.",
        events: [
          { type: "tool_call", name: "escalate_to_human", args: input.data },
          { type: "escalation", reason: input.data.reason, urgency: input.data.urgency },
        ],
      };
    }

    case "propose_callback": {
      const input = toolInputSchemas.propose_callback.safeParse(rawInput);
      if (!input.success) return error("Geçersiz girdi");
      return {
        result: JSON.stringify({ available_slots: MOCK_CALLBACK_SLOTS }),
        events: [
          {
            type: "tool_call",
            name: "propose_callback",
            args: input.data.preference ? { preference: input.data.preference } : {},
            result: MOCK_CALLBACK_SLOTS.join(", "),
          },
        ],
      };
    }

    case "end_conversation": {
      const input = toolInputSchemas.end_conversation.safeParse(rawInput);
      if (!input.success) return error("Geçersiz girdi");
      return {
        result:
          "Görüşme kapatıldı. Henüz veda etmediysen kısa bir veda cümlesi yaz; ettiysen başka bir şey yazma.",
        events: [
          {
            type: "tool_call",
            name: "end_conversation",
            args: input.data.callback_time
              ? { outcome: input.data.outcome, callback_time: input.data.callback_time }
              : { outcome: input.data.outcome },
          },
          { type: "stage", stage: "closed" },
        ],
        outcome: input.data.outcome,
      };
    }
  }
}
