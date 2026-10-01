import type z from 'zod';

import { type workflowFormFieldSchema } from '@/workflow/schemas/form-action-settings-schema';

// Workflow form steps issue this call too, so they and agent form requests are answered alike; answers are keyed by field name.
export type RequestFormField = Pick<
  z.infer<typeof workflowFormFieldSchema>,
  'name' | 'label' | 'type' | 'placeholder' | 'settings'
>;

export type RequestFormToolInput = {
  fields: RequestFormField[];
};
