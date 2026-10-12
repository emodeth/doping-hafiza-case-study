import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ConversationSummary, InterestLevel } from "@/lib/types";
import { anthropic, EFFORT, MODEL } from "./config";

const SummarySchema = z.object({
  questionsAsked: z.array(z.string()),
  nextStep: z.string(),
  callbackTime: z.string().nullable(),
  needsHuman: z.boolean(),
  humanReasons: z.array(z.string()),
  notes: z.string(),
});

const SUMMARY_PROMPT = `Bir içerik üreticisiyle yapılan tanışma görüşmesinin transkriptini, insan yöneticinin hızlıca okuyacağı bir özete dönüştürüyorsun. Tüm alanları Türkçe doldur.

- questionsAsked: Kişinin sorduğu sorular, kendi ifadesine yakın şekilde. Soru sormadıysa boş liste.
- nextStep: Kısa ifade (ör. "Yönetici görüşmesi", "Tekrar arama", "Süreç kapatıldı").
- callbackTime: Kararlaştırılan saat, yoksa null.
- needsHuman / humanReasons: Yöneticinin özellikle ilgilenmesi gereken konular (devredilen talepler, bilgi tabanında cevabı olmayan sorular, şikâyetler). Yoksa false ve boş liste.
- notes: Yöneticiye yardımcı olacak 1-2 cümlelik gözlem.

Yalnızca transkriptte geçen bilgileri kullan.`;

function blockToLine(role: Anthropic.MessageParam["role"], block: Anthropic.ContentBlockParam): string | null {
  switch (block.type) {
    case "text":
      return `${role === "assistant" ? "Asistan" : "Kişi"}: ${block.text}`;
    case "tool_use":
      return block.name === "set_stage" ? null : `[tool çağrısı] ${block.name} ${JSON.stringify(block.input)}`;
    default:
      return null;
  }
}

export function toTranscript(messages: Anthropic.MessageParam[]): string {
  return messages
    .flatMap((message) =>
      typeof message.content === "string"
        ? [`${message.role === "assistant" ? "Asistan" : "Kişi"}: ${message.content}`]
        : message.content.map((block) => blockToLine(message.role, block)),
    )
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export async function summarizeConversation(
  messages: Anthropic.MessageParam[],
  interest: InterestLevel,
  signal?: AbortSignal,
): Promise<ConversationSummary | null> {
  const response = await anthropic.messages.parse(
    {
      model: MODEL,
      max_tokens: 2048,
      system: SUMMARY_PROMPT,
      output_config: { effort: EFFORT, format: zodOutputFormat(SummarySchema) },
      messages: [{ role: "user", content: toTranscript(messages) }],
    },
    { signal },
  );

  if (response.stop_reason === "refusal" || !response.parsed_output) return null;

  const { callbackTime, ...rest } = response.parsed_output;
  return { ...rest, interest, callbackTime: callbackTime ?? undefined };
}
