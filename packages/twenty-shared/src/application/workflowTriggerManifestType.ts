import { z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';

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
    settings: z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('DAYS'),
        schedule: z.strictObject({
          day: z.int().min(1),
          hour: z.int().min(0).max(23),
          minute: z.int().min(0).max(59),
        }),
      }),
      z.strictObject({
        type: z.literal('HOURS'),
        schedule: z.strictObject({
          hour: z.int().min(1),
          minute: z.int().min(0).max(59),
        }),
      }),
      z.strictObject({
        type: z.literal('MINUTES'),
        schedule: z.strictObject({ minute: z.int().min(1).max(60) }),
      }),
      z.strictObject({
        type: z.literal('CUSTOM'),
        pattern: z.string().min(1),
      }),
    ]),
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
