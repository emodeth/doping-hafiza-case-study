import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-haiku-5-5";

export const EFFORT = "low" as const;

export const MAX_TOOL_ITERATIONS = 6;

export const MAX_USER_TURNS = 30;

export const anthropic = new Anthropic();
