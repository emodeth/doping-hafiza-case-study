import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { ChatStreamChunk } from "@/lib/chat-protocol";
import { GREETING } from "@/lib/knowledge";
import type { InterestLevel } from "@/lib/types";
import { anthropic, EFFORT, MAX_TOOL_ITERATIONS, MODEL } from "./config";
import { executeTool } from "./execute-tool";
import { summarizeConversation } from "./summarize";
import { SYSTEM_PROMPT } from "./system-prompt";
import { TOOLS } from "./tools";

const CONVERSATION_PREFIX: Anthropic.MessageParam[] = [
  { role: "user", content: "(Görüşme başladı.)" },
  { role: "assistant", content: GREETING },
];

const event = (e: Extract<ChatStreamChunk, { kind: "event" }>["event"]): ChatStreamChunk => ({
  kind: "event",
  event: e,
});

export async function* runAssistantTurn(
  history: Anthropic.MessageParam[],
  userMessage: string,
  signal?: AbortSignal,
): AsyncGenerator<ChatStreamChunk> {
  const newMessages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];
  let hasText = false;
  let outcome: InterestLevel | undefined;

  if (history.length === 0) yield event({ type: "stage", stage: "availability" });

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const stream = anthropic.messages.stream(
      {
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        output_config: { effort: EFFORT },
        cache_control: { type: "ephemeral" },
        messages: [...CONVERSATION_PREFIX, ...history, ...newMessages],
      },
      { signal },
    );

    let needsSeparator = hasText;
    for await (const streamEvent of stream) {
      if (streamEvent.type === "content_block_delta" && streamEvent.delta.type === "text_delta") {
        let text = streamEvent.delta.text;
        if (needsSeparator) {
          text = " " + text.trimStart();
          needsSeparator = false;
        }
        hasText = true;
        yield event({ type: "assistant_delta", text });
      }
    }

    const message = await stream.finalMessage();
    if (process.env.NODE_ENV === "development") {
      const { input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens } =
        message.usage;
      console.log(
        `[assistant] stop=${message.stop_reason} in=${input_tokens} cache_read=${cache_read_input_tokens} cache_write=${cache_creation_input_tokens} out=${output_tokens}`,
      );
    }

    if (message.stop_reason === "refusal") {
      yield { kind: "error", message: "Asistan bu mesaja cevap veremedi." };
      break;
    }

    newMessages.push({ role: "assistant", content: message.content });

    const toolUses = message.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (message.stop_reason !== "tool_use" || toolUses.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      const execution = executeTool(toolUse.name, toolUse.input);
      for (const e of execution.events) yield event(e);
      if (execution.outcome) outcome = execution.outcome;
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: execution.result,
        is_error: execution.isError,
      });
    }
    newMessages.push({ role: "user", content: toolResults });
  }

  yield event({ type: "assistant_done" });

  if (outcome) {
    let summary = null;
    try {
      summary = await summarizeConversation(
        [...CONVERSATION_PREFIX, ...history, ...newMessages],
        outcome,
        signal,
      );
    } catch (error) {
      if (signal?.aborted) throw error;
      console.error("[assistant] summary failed", error);
    }
    yield summary
      ? event({ type: "summary", summary })
      : { kind: "error", message: "Görüşme özeti oluşturulamadı." };
  }

  yield { kind: "history", messages: newMessages };
}
