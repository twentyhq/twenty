import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { expectedOutputSchemaShape } from './expected-output-schema-shape';

export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z
      .object({
        code: z
          .string()
          .max(256_000)
          .optional()
          .describe(
            'The TypeScript source of the step. It must export a `main` function, which receives logicFunctionInput as its only argument and returns an object.',
          ),
        logicFunctionId: z
          .string()
          .optional()
          .describe(
            'Deprecated: only set on steps created before inline code. Do NOT set this; write the source in `code` instead.',
          ),
        logicFunctionInput: z
          .record(z.string(), z.any())
          .describe(
            'Key-value map of input parameters passed to `main` at runtime.',
          ),
      })
      .refine(
        (input) =>
          isNonEmptyString(input.code) ||
          isNonEmptyString(input.logicFunctionId),
        {
          message:
            'A CODE step needs a non-empty `code` (or, for legacy steps, a `logicFunctionId`).',
        },
      ),
    ...expectedOutputSchemaShape,
  });
