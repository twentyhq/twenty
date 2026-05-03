import { type InputSchema } from '@/workflow/types/InputSchema';

// Exposes a logic function as a step in the visual workflow builder.
// Uses Twenty's rich InputSchema with FieldMetadataType support so the
// builder can render proper field editors, variable pickers, and labels.
export type WorkflowActionTriggerSettings = {
  inputSchema: InputSchema;
  outputSchema?: InputSchema;
  icon?: string;
  label?: string;
};
