import { z } from 'zod';

import { workflowStepFilterManifestSchema } from '@/application/workflowStepManifestType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { isDefined } from '@/utils/validation/isDefined';
import { workflowCronTriggerSchema } from '@/workflow/schemas/cron-trigger-schema';
import { stepFilterGroupSchema } from '@/workflow/schemas/step-filter-group-schema';

const DATABASE_EVENT_ACTIONS_WITH_WATCHED_FIELDS = ['updated', 'upserted'];

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
  z.strictObject({
    universalIdentifier: z.uuid(),
    type: z.literal('DATABASE_EVENT'),
    nextStepIds: z.array(z.uuid()).min(1),
    settings: z
      .strictObject({
        objectUniversalIdentifier: z.uuid(),
        action: z.enum(['created', 'updated', 'deleted', 'upserted']),
        fieldUniversalIdentifiers: z.array(z.uuid()).optional(),
        filter: z
          .strictObject({
            stepFilterGroups: z.array(stepFilterGroupSchema),
            stepFilters: z.array(
              workflowStepFilterManifestSchema.extend({
                operand: z.enum(ViewFilterOperand),
              }),
            ),
          })
          .optional(),
      })
      .superRefine((settings, context) => {
        if (
          isNonEmptyArray(settings.fieldUniversalIdentifiers) &&
          !DATABASE_EVENT_ACTIONS_WITH_WATCHED_FIELDS.includes(settings.action)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['fieldUniversalIdentifiers'],
            message: `Watched fields only apply to ${DATABASE_EVENT_ACTIONS_WITH_WATCHED_FIELDS.join(' and ')} events`,
          });
        }

        if (!isDefined(settings.filter)) {
          return;
        }

        const stepFilterGroupIds = new Set(
          settings.filter.stepFilterGroups.map(
            (stepFilterGroup) => stepFilterGroup.id,
          ),
        );

        settings.filter.stepFilterGroups.forEach((stepFilterGroup, index) => {
          if (
            isDefined(stepFilterGroup.parentStepFilterGroupId) &&
            !stepFilterGroupIds.has(stepFilterGroup.parentStepFilterGroupId)
          ) {
            context.addIssue({
              code: 'custom',
              path: [
                'filter',
                'stepFilterGroups',
                index,
                'parentStepFilterGroupId',
              ],
              message: `Filter group ${stepFilterGroup.parentStepFilterGroupId} is not declared in stepFilterGroups`,
            });
          }
        });

        settings.filter.stepFilters.forEach((stepFilter, index) => {
          if (!stepFilterGroupIds.has(stepFilter.stepFilterGroupId)) {
            context.addIssue({
              code: 'custom',
              path: ['filter', 'stepFilters', index, 'stepFilterGroupId'],
              message: `Filter group ${stepFilter.stepFilterGroupId} is not declared in stepFilterGroups`,
            });
          }
        });
      }),
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
