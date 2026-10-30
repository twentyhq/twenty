import {
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
  type RequestFormToolResult,
  validateAiFormFields,
} from 'twenty-shared/ai';
import { workflowFormFieldSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

export { REQUEST_FORM_TOOL_NAME };

const requestFormFieldSchema = workflowFormFieldSchema.pick({
  name: true,
  label: true,
  type: true,
  placeholder: true,
  settings: true,
});

// A form step issues this call with every field of its form, so a recorded
// call is read without the limits an agent is held to.
export const requestFormCallSchema = z.object({
  fields: z.array(requestFormFieldSchema),
});

export const requestFormInputSchema = z.object({
  fields: z
    .array(requestFormFieldSchema)
    .min(1)
    .max(10)
    .refine(
      (fields) =>
        new Set(fields.map((field) => field.name)).size === fields.length,
      { message: 'Each field needs its own name.' },
    )
    .superRefine((fields, context) => {
      for (const message of validateAiFormFields(fields)) {
        context.addIssue({ code: 'custom', message });
      }
    })
    .describe(
      'The fields to fill in, in order. Each name is unique and keys its value in the result. ' +
        'A RECORD field needs settings.objectName, the singular name of the object to pick from (e.g. "company"). ' +
        'A SELECT or MULTI_SELECT field offers either the options of an existing select field, with settings.selectedFieldId, ' +
        'or up to 20 options you list yourself, with settings {"optionSource": "inline", "options": [{"value": "friendly", "label": "Friendly and concise"}]}; never both. ' +
        'Set settings.required to true for a field the user must fill in.',
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
    'choices you list or options of an existing select field, or records picked from the workspace. The conversation ' +
    'pauses until they submit it, then continues with the values keyed by field name. Prefer ' +
    'ask_questions for a choice between a few options you can list yourself.',
  inputSchema: requestFormInputSchema,
  execute: async (
    _input: RequestFormToolInput,
  ): Promise<RequestFormPendingOutput> => buildRequestFormPendingOutput(),
});
