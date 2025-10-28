import { z } from 'zod';
import { FieldMetadataType } from '../../types/FieldMetadataType';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowFormActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        label: z.string(),
        type: z.union([
          z.literal(FieldMetadataType.TEXT),
          z.literal(FieldMetadataType.NUMBER),
          z.literal(FieldMetadataType.DATE),
          z.literal(FieldMetadataType.SELECT),
          z.literal('RECORD'),
        ]),
        placeholder: z.string().optional(),
        settings: z.record(z.string(), z.any()).optional(),
        value: z.any().optional(),
      }),
    ),
  });
