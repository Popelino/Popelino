import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { config } from "../config.ts";

const client = new Anthropic();

export interface GenerateOptions<T extends z.ZodType> {
  system: string;
  prompt: string;
  schema: T;
  maxTokens?: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
}

/** One structured-output call to Claude, validated against a Zod schema. */
export async function generate<T extends z.ZodType>(
  options: GenerateOptions<T>,
): Promise<z.infer<T>> {
  const response = await client.messages.parse({
    model: config.model,
    max_tokens: options.maxTokens ?? 16000,
    system: options.system,
    output_config: {
      effort: options.effort ?? "high",
      format: zodOutputFormat(options.schema),
    },
    messages: [{ role: "user", content: options.prompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(
      `Claude declined the request (${response.stop_details?.category ?? "unknown"})`,
    );
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Response hit max_tokens before completing — raise maxTokens");
  }
  if (!response.parsed_output) {
    throw new Error(`No structured output returned (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output;
}

/** The channel brief every generation step is grounded in. */
export function channelBrief(): string {
  return [
    `Channel: ${config.channel.name}`,
    `Subject matter: ${config.channel.topic}`,
    `Audience: ${config.channel.audience}`,
    `Voice: ${config.channel.tone}`,
    `Format: ${config.format === "short" ? "vertical short" : "horizontal long-form"}, about ${config.targetDurationSec} seconds`,
  ].join("\n");
}
