import { type AiChatOpenForm } from 'twenty-shared/ai';
import { z } from 'zod';

export const createFillOpenFormTool = (openForm: AiChatOpenForm) => ({
  description:
    'Fill the form the user has open with values for its fields. Nothing is saved: the user reviews the form and saves it. ' +
    'When the user describes what the open form should contain, use this instead of a tool that saves the same thing.',
  inputSchema: z.object({
    values: z
      .object(
        Object.fromEntries(
          openForm.fields.map((field) => [
            field.name,
            z.string().optional().describe(field.description),
          ]),
        ),
      )
      .describe(
        'Values for the form fields. A field left out keeps its current value.',
      ),
  }),
  execute: async ({ values }: { values: Record<string, string> }) => ({
    success: true,
    message:
      'Sent the values to the open form. Nothing is saved until the user saves it.',
    result: { formId: openForm.formId, values },
  }),
});
