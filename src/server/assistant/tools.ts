import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const STAGE_VALUES = ["availability", "pitch", "qa", "scheduling", "closed"] as const;
export const URGENCY_VALUES = ["low", "medium", "high"] as const;
export const OUTCOME_VALUES = ["interested", "maybe", "callback", "not_interested"] as const;

// strict modda tüm alanlar required olduğundan opsiyonel alanlar null kabul eder.
export const toolInputSchemas = {
  set_stage: z.object({ stage: z.enum(STAGE_VALUES) }),
  lookup_info: z.object({ topic: z.string() }),
  escalate_to_human: z.object({
    reason: z.string(),
    urgency: z.enum(URGENCY_VALUES),
  }),
  propose_callback: z.object({ preference: z.string().nullable() }),
  end_conversation: z.object({
    outcome: z.enum(OUTCOME_VALUES),
    callback_time: z.string().nullable(),
  }),
};

export type AssistantToolName = keyof typeof toolInputSchemas;

export function isAssistantTool(name: string): name is AssistantToolName {
  return name in toolInputSchemas;
}

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "set_stage",
    description:
      "Konuşma yeni bir aşamaya geçtiğinde çağrılır. Operatör panelinde aşamayı günceller.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        stage: { type: "string", enum: [...STAGE_VALUES] },
      },
      required: ["stage"],
      additionalProperties: false,
    },
  },
  {
    name: "lookup_info",
    description:
      "Çalışma koşulları bilgi tabanında bir konuyu arar. Kişiye proje veya koşullar hakkında bilgi vermeden önce her zaman çağrılmalı. Konu bulunamazsa found: false döner.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "Bilinen konu anahtarlarından biri (project, streamFrequency, compensation, clips, contentTopics, nextSteps) veya bilinmeyen bir konu için kısa İngilizce anahtar (ör. contract, equipment).",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Asistanın yetkisi dışındaki veya bilgi tabanında olmayan bir konuyu insan yöneticiye devreder.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Yöneticinin ne ile ilgilenmesi gerektiğinin kısa Türkçe açıklaması.",
        },
        urgency: { type: "string", enum: [...URGENCY_VALUES] },
      },
      required: ["reason", "urgency"],
      additionalProperties: false,
    },
  },
  {
    name: "propose_callback",
    description:
      "Yönetici görüşmesi veya geri arama için uygun saatleri döner. Saat önermeden önce çağrılmalı; saat uydurulmamalı.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        preference: {
          type: ["string", "null"],
          description: "Kişinin belirttiği tercih (ör. 'yarın öğleden sonra'), yoksa null.",
        },
      },
      required: ["preference"],
      additionalProperties: false,
    },
  },
  {
    name: "end_conversation",
    description:
      "Görüşmeyi kapatır ve özet oluşturulmasını tetikler. Kişi ilgilenmediğini söylediğinde veya sonraki adım netleştiğinde çağrılır.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        outcome: {
          type: "string",
          enum: [...OUTCOME_VALUES],
          description:
            "interested: ilgili ve yönetici görüşmesi planlandı. maybe: ilgili ama şartlı veya kararsız (ör. ücret/sözleşme netleşmeden karar vermeyecek). callback: proje henüz konuşulamadı, sadece geri arama planlandı. not_interested: ilgilenmiyor.",
        },
        callback_time: {
          type: ["string", "null"],
          description: "Kararlaştırılan görüşme veya geri arama saati, yoksa null.",
        },
      },
      required: ["outcome", "callback_time"],
      additionalProperties: false,
    },
  },
];
