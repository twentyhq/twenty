import type z from 'zod';

import { type workflowFormFieldSchema } from '@/workflow/schemas/form-action-settings-schema';

// A workflow form step issues this call with its own fields, so a form step
// and an agent asking for a form are answered the same way. Answers are keyed
// by field name.
export type RequestFormField = Pick<
  z.infer<typeof workflowFormFieldSchema>,
  'name' | 'label' | 'type' | 'placeholder' | 'settings'
>;

export type RequestFormToolInput = {
  fields: RequestFormField[];
};
