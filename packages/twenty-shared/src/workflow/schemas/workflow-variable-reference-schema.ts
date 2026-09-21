import { z } from 'zod';

export const workflowVariableReferenceSchema = z
  .string()
  .regex(
    /^{{[^{}]+}}$/,
    'Expected a workflow variable reference like {{stepId.path}}',
  );
