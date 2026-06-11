import { workflowCodeActionSchema } from '@/workflow/schemas/code-action-schema';
import { workflowIfElseActionSchema } from '@/workflow/schemas/if-else-action-schema';
import { workflowIteratorActionSchema } from '@/workflow/schemas/iterator-action-schema';

export const WORKFLOW_VALIDATION_STEP_TYPES = {
  CODE: workflowCodeActionSchema.shape.type.value,
  IF_ELSE: workflowIfElseActionSchema.shape.type.value,
  ITERATOR: workflowIteratorActionSchema.shape.type.value,
} as const;
