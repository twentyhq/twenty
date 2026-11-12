import { z } from 'zod';
import { workflowCreateRecordActionSchema } from './create-record-action-schema';
import { workflowCreateRecordActionSettingsSchema } from './create-record-action-settings-schema';
import { workflowFindRecordsActionSchema } from './find-records-action-schema';
import { workflowFindRecordsActionSettingsSchema } from './find-records-action-settings-schema';
import { recordSortSchema } from './record-sort-schema';
import { workflowUpsertRecordActionSchema } from './upsert-record-action-schema';
import { workflowUpsertRecordActionSettingsSchema } from './upsert-record-action-settings-schema';
import { workflowActionSchema } from './workflow-action-schema';
import { workflowRunStateStepInfosSchema } from './workflow-run-state-step-infos-schema';
import { workflowTriggerSchema } from './workflow-trigger-schema';

const pastRunFindRecordsStepSchema = workflowFindRecordsActionSchema.extend({
  settings: workflowFindRecordsActionSettingsSchema.extend({
    input: workflowFindRecordsActionSettingsSchema.shape.input.extend({
      orderBy: z
        .object({ recordSorts: z.array(recordSortSchema).optional() })
        .optional(),
    }),
  }),
});

const pastRunCreateRecordStepSchema = workflowCreateRecordActionSchema.extend({
  settings: workflowCreateRecordActionSettingsSchema.extend({
    input: workflowCreateRecordActionSettingsSchema.shape.input.strip(),
  }),
});

const pastRunUpsertRecordStepSchema = workflowUpsertRecordActionSchema.extend({
  settings: workflowUpsertRecordActionSettingsSchema.extend({
    input: workflowUpsertRecordActionSettingsSchema.shape.input.strip(),
  }),
});

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(
      z.union([
        pastRunFindRecordsStepSchema,
        pastRunCreateRecordStepSchema,
        pastRunUpsertRecordStepSchema,
        workflowActionSchema,
      ]),
    ),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});
