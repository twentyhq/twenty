import { z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
import { workflowCronTriggerSchema } from '@/workflow/schemas/cron-trigger-schema';

const manualTriggerAvailabilityManifestSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('GLOBAL') }),
  z.strictObject({
    type: z.literal('SINGLE_RECORD'),
    objectUniversalIdentifier: z.uuid(),
  }),
  z.strictObject({
    type: z.literal('BULK_RECORDS'),
    objectUniversalIdentifier: z.uuid(),
  }),
]);

const [
  dailyCronSettingsSchema,
  hourlyCronSettingsSchema,
  minutelyCronSettingsSchema,
  customCronSettingsSchema,
] = workflowCronTriggerSchema.shape.settings.options;

const cronTriggerSettingsManifestSchema = z.discriminatedUnion('type', [
  dailyCronSettingsSchema
    .omit({ outputSchema: true })
    .extend({ schedule: dailyCronSettingsSchema.shape.schedule.strict() })
    .strict(),
  hourlyCronSettingsSchema
    .omit({ outputSchema: true })
    .extend({ schedule: hourlyCronSettingsSchema.shape.schedule.strict() })
    .strict(),
  minutelyCronSettingsSchema
    .omit({ outputSchema: true })
    .extend({ schedule: minutelyCronSettingsSchema.shape.schedule.strict() })
    .strict(),
  customCronSettingsSchema.omit({ outputSchema: true }).strict(),
]);

const workflowTriggerManifestOptions = [
  z.strictObject({
    universalIdentifier: z.uuid(),
    type: z.literal('MANUAL'),
    nextStepIds: z.array(z.uuid()).min(1),
    settings: z
      .strictObject({
        availability: manualTriggerAvailabilityManifestSchema.optional(),
        icon: z.string().optional(),
        isPinned: z.boolean().optional(),
      })
      .superRefine((settings, context) => {
        if (
          !isDefined(settings.availability) &&
          (isDefined(settings.icon) || isDefined(settings.isPinned))
        ) {
          context.addIssue({
            code: 'custom',
            path: ['availability'],
            message:
              'Set an availability for the icon and pin to show in the command menu',
          });
        }
      })
      .optional(),
  }),
  z.strictObject({
    universalIdentifier: z.uuid(),
    type: z.literal('CRON'),
    nextStepIds: z.array(z.uuid()).min(1),
    settings: cronTriggerSettingsManifestSchema,
  }),
] as const;

export const APPLICATION_WORKFLOW_TRIGGER_TYPES: readonly string[] =
  workflowTriggerManifestOptions.map((option) => option.shape.type.value);

export const workflowTriggerManifestSchema = z.discriminatedUnion(
  'type',
  workflowTriggerManifestOptions,
  {
    error: (issue) =>
      issue.code === 'invalid_union'
        ? `Unsupported trigger type. Application workflows support: ${APPLICATION_WORKFLOW_TRIGGER_TYPES.join(', ')}`
        : undefined,
  },
);

export type WorkflowTriggerManifest = z.infer<
  typeof workflowTriggerManifestSchema
>;
