import type Anthropic from "@anthropic-ai/sdk";
import type { ConversationEvent } from "./types";

/**
 * /api/chat sözleşmesi.
 *
 * Sunucu stateless: API'nin ham mesaj geçmişini client tutar ve her turda
 * olduğu gibi geri gönderir. Geçmiş yalnızca sona ekleme ile büyür; düşünme
 * bloklarının geçerli kalması için hiçbir mesaj düzenlenmez.
 */
export interface ChatRequestBody {
  history: Anthropic.MessageParam[];
  userMessage: string;
}

/** Yanıt, satır satır JSON (NDJSON) olarak stream edilen parçalardan oluşur. */
export type ChatStreamChunk =
  | { kind: "event"; event: ConversationEvent }
  /** Bu turda geçmişe eklenecek mesajlar; tur sonunda bir kez gelir */
  | { kind: "history"; messages: Anthropic.MessageParam[] }
  | { kind: "error"; message: string };
