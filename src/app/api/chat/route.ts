import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequestBody, ChatStreamChunk } from "@/lib/chat-protocol";
import { MAX_USER_TURNS } from "@/server/assistant/config";
import { runAssistantTurn } from "@/server/assistant/run-turn";

export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 2000;

function countUserTurns(history: ChatRequestBody["history"]) {
  return history.filter((m) => m.role === "user" && typeof m.content === "string").length;
}

function toUserFacingError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return "API anahtarı geçersiz.";
  if (error instanceof Anthropic.RateLimitError) return "Çok fazla istek gönderildi, biraz sonra tekrar deneyin.";
  if (error instanceof Anthropic.BadRequestError) return "İstek işlenemedi.";
  if (error instanceof Anthropic.APIConnectionError) return "Asistana bağlanılamadı.";
  if (error instanceof Anthropic.APIError) return "Asistan şu an cevap veremiyor.";
  return "Beklenmeyen bir hata oluştu.";
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  if (!userMessage || userMessage.length > MAX_MESSAGE_LENGTH || !Array.isArray(body.history)) {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  if (countUserTurns(body.history) >= MAX_USER_TURNS) {
    return Response.json({ error: "Görüşme mesaj limitine ulaştı" }, { status: 429 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: ChatStreamChunk) =>
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));

      try {
        for await (const chunk of runAssistantTurn(body.history, userMessage, request.signal)) {
          send(chunk);
        }
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("[api/chat]", error);
          send({ kind: "error", message: toUserFacingError(error) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
