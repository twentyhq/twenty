import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';
import { CODE_STEP_SOURCE_MAX_LENGTH } from '@/workflow/constants/CodeStepSourceMaxLength';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { expectedOutputSchemaShape } from './expected-output-schema-shape';

// Kept unrefined so application manifests can omit and extend it
export const workflowCodeActionInputSchema = z.object({
  code: z
    .string()
    .max(CODE_STEP_SOURCE_MAX_LENGTH)
    .optional()
    .describe(
      'The TypeScript source of the step. It must export `main` as an async arrow function, `export const main = async (params: { ... }) => { ... }`: params receives logicFunctionInput, its type declares the step inputs, and it returns an object.',
    ),
  logicFunctionId: z
    .string()
    .optional()
    .describe(
      'Deprecated: only set on steps created before inline code. Do NOT set this; write the source in `code` instead.',
    ),
  logicFunctionInput: z
    .record(z.string(), z.any())
    .describe('Key-value map of input parameters passed to `main` at runtime.'),
});

export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: workflowCodeActionInputSchema.refine(
      (input) =>
        isNonEmptyString(input.code) || isNonEmptyString(input.logicFunctionId),
      {
        message:
          'A CODE step needs a non-empty `code` (or, for legacy steps, a `logicFunctionId`).',
      },
    ),
    ...expectedOutputSchemaShape,
  });
