import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

// inputSchema is optional in the SDK; the manifest builder infers it from the handler source.
export type ToolTriggerSettings = {
  inputSchema?: InputJsonSchema;
  // Front component that renders this tool's calls in the AI chat; resolved to its id when descriptors are built.
  frontComponentUniversalIdentifier?: string;
};
