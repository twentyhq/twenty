import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowCreateOrUpdateRecordActionSettingsSchema } from './create-or-update-record-action-settings-schema';

export const workflowCreateOrUpdateRecordActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('CREATE_OR_UPDATE_RECORD'),
    settings: workflowCreateOrUpdateRecordActionSettingsSchema,
  });
