import { workflowCodeActionSchema } from '@/workflow/schemas/code-action-schema';
import { workflowIfElseActionSchema } from '@/workflow/schemas/if-else-action-schema';
import { workflowIteratorActionSchema } from '@/workflow/schemas/iterator-action-schema';

export const CODE_STEP_TYPE = workflowCodeActionSchema.shape.type.value;
export const IF_ELSE_STEP_TYPE = workflowIfElseActionSchema.shape.type.value;
export const ITERATOR_STEP_TYPE = workflowIteratorActionSchema.shape.type.value;
