import {
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { workflowFormFieldSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

export { REQUEST_FORM_TOOL_NAME };

export const requestFormInputSchema = z.object({
  fields: z
    .array(
      workflowFormFieldSchema.pick({
        name: true,
        label: true,
        type: true,
        placeholder: true,
        settings: true,
      }),
    )
    .min(1)
    .max(10)
    .refine(
      (fields) =>
        new Set(fields.map((field) => field.name)).size === fields.length,
      { message: 'Each field needs its own name.' },
    )
    .describe(
      'The fields to fill in, in order. Each name is unique and keys its value in the result. ' +
        'A RECORD field needs settings.objectName, the singular name of the object to pick from (e.g. "company"). ' +
        'A SELECT or MULTI_SELECT field needs settings.selectedFieldId, the id of an existing select field whose options it offers.',
    ),
});

type RequestFormPendingOutput = {
  success: true;
  message: string;
  result: RequestFormToolResult;
};

// A workflow form step writes the same output when it issues this call.
export const buildRequestFormPendingOutput = (): RequestFormPendingOutput => ({
  success: true,
  message: 'Form presented to the user; awaiting their answer.',
  result: { status: 'pending' },
});

export const createRequestFormTool = () => ({
  description:
    'Ask the user to fill in a form when you need typed values from them: text, numbers, dates, ' +
    'options of an existing select field, or records picked from the workspace. The conversation ' +
    'pauses until they submit it, then continues with the values keyed by field name. Prefer ' +
    'ask_questions for a choice between a few options you can list yourself.',
  inputSchema: requestFormInputSchema,
  execute: async (
    _input: RequestFormToolInput,
  ): Promise<RequestFormPendingOutput> => buildRequestFormPendingOutput(),
});
