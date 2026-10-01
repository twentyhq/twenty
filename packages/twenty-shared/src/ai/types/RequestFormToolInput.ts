import type z from 'zod';

import { type workflowFormFieldSchema } from '@/workflow/schemas/form-action-settings-schema';

// Workflow form steps issue this call too, so both are answered the same way.
export type RequestFormField = Pick<
  z.infer<typeof workflowFormFieldSchema>,
  'name' | 'label' | 'type' | 'placeholder' | 'settings'
>;

export type RequestFormToolInput = {
  fields: RequestFormField[];
};
