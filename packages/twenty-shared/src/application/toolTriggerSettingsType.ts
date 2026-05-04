import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

// Exposes a logic function as an AI tool (chat / MCP / function calling).
// Uses standard JSON Schema -- the format LLMs natively understand.
// inputSchema is optional in the developer-facing SDK; the manifest
// builder fills it in by inferring from the handler source code when omitted.
export type ToolTriggerSettings = {
  inputSchema?: InputJsonSchema;
};
