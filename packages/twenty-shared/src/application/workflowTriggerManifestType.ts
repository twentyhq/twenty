import { z } from 'zod';

import { workflowStepFilterManifestSchema } from '@/application/workflowStepManifestType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { isDefined } from '@/utils/validation/isDefined';
import { workflowCronTriggerSchema } from '@/workflow/schemas/cron-trigger-schema';
import { stepFilterGroupSchema } from '@/workflow/schemas/step-filter-group-schema';
import { workflowWebhookTriggerSchema } from '@/workflow/schemas/webhook-trigger-schema';

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

const [getRequestWebhookSettingsSchema, postRequestWebhookSettingsSchema] =
  workflowWebhookTriggerSchema.shape.settings.options;

const webhookTriggerSettingsManifestSchema = z.discriminatedUnion(
  'httpMethod',
  [
    getRequestWebhookSettingsSchema
      .omit({ outputSchema: true, authentication: true })
      .strict(),
    postRequestWebhookSettingsSchema
      .omit({
        outputSchema: true,
        expectedOutputSchema: true,
        authentication: true,
      })
      .strict(),
  ],
);

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

        const parentIdByStepFilterGroupId = new Map<
          string,
          string | undefined
        >();

        settings.filter.stepFilterGroups.forEach((stepFilterGroup, index) => {
          if (parentIdByStepFilterGroupId.has(stepFilterGroup.id)) {
            context.addIssue({
              code: 'custom',
              path: ['filter', 'stepFilterGroups', index, 'id'],
              message: `Filter group ${stepFilterGroup.id} is declared more than once`,
            });
          }

          parentIdByStepFilterGroupId.set(
            stepFilterGroup.id,
            stepFilterGroup.parentStepFilterGroupId,
          );
        });

        settings.filter.stepFilterGroups.forEach((stepFilterGroup, index) => {
          const parentId = stepFilterGroup.parentStepFilterGroupId;
          const path = [
            'filter',
            'stepFilterGroups',
            index,
            'parentStepFilterGroupId',
          ];

          if (!isDefined(parentId)) {
            return;
          }

          if (!parentIdByStepFilterGroupId.has(parentId)) {
            context.addIssue({
              code: 'custom',
              path,
              message: `Filter group ${parentId} is not declared in stepFilterGroups`,
            });

            return;
          }

          const visitedIds = new Set([stepFilterGroup.id]);

          for (
            let ancestorId: string | undefined = parentId;
            isDefined(ancestorId);
            ancestorId = parentIdByStepFilterGroupId.get(ancestorId)
          ) {
            if (visitedIds.has(ancestorId)) {
              context.addIssue({
                code: 'custom',
                path,
                message: `Filter group ${stepFilterGroup.id} is not reachable from a root group`,
              });

              return;
            }

            visitedIds.add(ancestorId);
          }
        });

        settings.filter.stepFilters.forEach((stepFilter, index) => {
          if (!parentIdByStepFilterGroupId.has(stepFilter.stepFilterGroupId)) {
            context.addIssue({
              code: 'custom',
              path: ['filter', 'stepFilters', index, 'stepFilterGroupId'],
              message: `Filter group ${stepFilter.stepFilterGroupId} is not declared in stepFilterGroups`,
            });
          }
        });
      }),
  }),
  z.strictObject({
    universalIdentifier: z.uuid(),
    type: z.literal('WEBHOOK'),
    nextStepIds: z.array(z.uuid()).min(1),
    settings: webhookTriggerSettingsManifestSchema,
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
