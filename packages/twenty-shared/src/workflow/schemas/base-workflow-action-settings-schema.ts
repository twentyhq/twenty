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
    }),
    continueOnFailure: z.object({
      value: z
        .boolean()
        .describe('Whether to continue to the next step if this action fails.'),
    }),
  }),
});
