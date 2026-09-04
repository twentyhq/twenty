import { z } from 'zod';

export const baseWorkflowActionSettingsSchema = z.object({
  input: z
    .looseObject({})
    .describe(
      'Input data for the workflow action. Structure depends on the action type.',
    ),
  outputSchema: z
    .looseObject({})
    .describe(
      'Schema defining the output data structure. This data can be referenced in subsequent steps using {{stepId.fieldName}}.',
    ),
  errorHandlingOptions: z.object({
    retryOnFailure: z.object({
      value: z.boolean().describe('Whether to retry the action if it fails.'),
      maxAttempts: z
        .number()
        .int()
        .min(1)
        .max(3)
        .optional()
        .describe(
          'How many retry attempts to make, between 1 and 3. Defaults to 3.',
        ),
    }),
    continueOnFailure: z.object({
      value: z
        .boolean()
        .describe('Whether to continue to the next step if this action fails.'),
    }),
  }),
});
