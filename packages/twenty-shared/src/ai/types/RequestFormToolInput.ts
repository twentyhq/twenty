import type z from 'zod';

import { type workflowFormFieldSchema } from '@/workflow/schemas/form-action-settings-schema';

export type RequestFormField = Pick<
  z.infer<typeof workflowFormFieldSchema>,
  'name' | 'label' | 'type' | 'placeholder' | 'settings'
>;

export type RequestFormToolInput = {
  fields: RequestFormField[];
};
