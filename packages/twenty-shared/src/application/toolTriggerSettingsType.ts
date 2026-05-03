import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

// Exposes a logic function as an AI tool (chat / MCP / function calling).
// Uses standard JSON Schema -- the format LLMs natively understand.
export type ToolTriggerSettings = {
  inputSchema: InputJsonSchema;
};
