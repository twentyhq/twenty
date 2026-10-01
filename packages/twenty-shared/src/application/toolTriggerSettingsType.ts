import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

// inputSchema is optional in the SDK; the manifest builder infers it from the handler source.
export type ToolTriggerSettings = {
  inputSchema?: InputJsonSchema;
  // Resolved to a front component id when descriptors are built.
  frontComponentUniversalIdentifier?: string;
};
