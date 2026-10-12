import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Model tek yerden yönetilir. Prototip hız ve maliyet için Haiku ile başlıyor;
 * kural takibini karşılaştırmak için buradan Opus'a geçilebilir.
 */
export const MODEL = "claude-haiku-5-5";

/** Sohbet turları kısa ve rutin olduğu için düşük effort yeterli. */
export const EFFORT = "low" as const;

/** Bir kullanıcı turunda modelin art arda yapabileceği en fazla tool döngüsü. */
export const MAX_TOOL_ITERATIONS = 6;

/** Demo maliyetini sınırlamak için konuşma başına en fazla kullanıcı mesajı. */
export const MAX_USER_TURNS = 30;

export const anthropic = new Anthropic();
