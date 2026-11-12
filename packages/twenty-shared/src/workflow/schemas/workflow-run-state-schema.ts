import { z } from 'zod';
import { workflowCronTriggerSchema } from './cron-trigger-schema';
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

// TODO: remove in 2.61, runs started before 2.59 keep a typed cron schedule until run cleanup purges them after 14 days
const pastRunCronTriggerSchema = workflowCronTriggerSchema.extend({
  settings: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('DAYS'),
        schedule: z.object({
          day: z.number(),
          hour: z.number(),
          minute: z.number(),
        }),
        outputSchema: z.looseObject({}),
      }),
      z.object({
        type: z.literal('HOURS'),
        schedule: z.object({ hour: z.number(), minute: z.number() }),
        outputSchema: z.looseObject({}),
      }),
      z.object({
        type: z.literal('MINUTES'),
        schedule: z.object({ minute: z.number() }),
        outputSchema: z.looseObject({}),
      }),
      z.object({
        type: z.literal('CUSTOM'),
        pattern: z.string(),
        outputSchema: z.looseObject({}),
      }),
    ])
    .transform((settings) => {
      switch (settings.type) {
        case 'DAYS':
          return {
            pattern: `${settings.schedule.minute} ${settings.schedule.hour} */${settings.schedule.day} * *`,
            outputSchema: settings.outputSchema,
          };
        case 'HOURS':
          return {
            pattern: `${settings.schedule.minute} */${settings.schedule.hour} * * *`,
            outputSchema: settings.outputSchema,
          };
        case 'MINUTES':
          return {
            pattern: `*/${settings.schedule.minute} * * * *`,
            outputSchema: settings.outputSchema,
          };
        case 'CUSTOM':
          return {
            pattern: settings.pattern,
            outputSchema: settings.outputSchema,
          };
      }
    }),
});

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: z.union([workflowTriggerSchema, pastRunCronTriggerSchema]),
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
