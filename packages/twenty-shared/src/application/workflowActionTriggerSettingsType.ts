import { type InputSchema } from '@/workflow/types/InputSchema';

// Exposes a logic function as a step in the visual workflow builder.
// Uses Twenty's rich InputSchema with FieldMetadataType support so the
// builder can render proper field editors, variable pickers, and labels.
// inputSchema is optional in the developer-facing SDK; the manifest builder
// fills it in by inferring from the handler source code when omitted.
export type WorkflowActionTriggerSettings = {
  inputSchema?: InputSchema;
  outputSchema?: InputSchema;
  icon?: string;
  label?: string;
};
