import { z } from 'zod';

import { workflowSendEmailActionSettingsSchema } from '@/workflow/schemas/send-email-action-settings-schema';
import { workflowCreateCalendarEventActionSettingsSchema } from '@/workflow/schemas/create-calendar-event-action-settings-schema';
import { workflowHttpRequestActionSettingsSchema } from '@/workflow/schemas/http-request-action-settings-schema';
import { workflowClassifyActionSettingsSchema } from '@/workflow/schemas/classify-action-settings-schema';
import { workflowIteratorActionSettingsSchema } from '@/workflow/schemas/iterator-action-settings-schema';
import { workflowDelayActionSettingsSchema } from '@/workflow/schemas/workflow-delay-action-settings-schema';
import { workflowEmptyActionSettingsSchema } from '@/workflow/schemas/empty-action-settings-schema';
import { baseWorkflowActionSettingsSchema } from '@/workflow/schemas/base-workflow-action-settings-schema';
import { workflowCreateRecordActionSettingsSchema } from '@/workflow/schemas/create-record-action-settings-schema';
import { workflowUpdateRecordActionSettingsSchema } from '@/workflow/schemas/update-record-action-settings-schema';
import { workflowUpsertRecordActionSettingsSchema } from '@/workflow/schemas/upsert-record-action-settings-schema';
import { workflowDeleteRecordActionSettingsSchema } from '@/workflow/schemas/delete-record-action-settings-schema';
import { workflowFindRecordsActionSettingsSchema } from '@/workflow/schemas/find-records-action-settings-schema';
import { workflowFormActionSettingsSchema } from '@/workflow/schemas/form-action-settings-schema';
import { workflowFilterActionSettingsSchema } from '@/workflow/schemas/filter-action-settings-schema';
import { workflowIfElseActionSettingsSchema } from '@/workflow/schemas/if-else-action-settings-schema';
import { stepFilterSchema } from '@/workflow/schemas/step-filter-schema';
import { workflowPickRecordStrategySchema } from '@/workflow/schemas/pick-record-action-settings-schema';

const baseStepShape = {
  universalIdentifier: z.uuid(),
  name: z.string().min(1),
  nextStepIds: z.array(z.uuid()),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  expectedOutputSchema: z.record(z.string(), z.unknown()).optional(),
  errorHandlingOptions:
    baseWorkflowActionSettingsSchema.shape.errorHandlingOptions.optional(),
};

const stepSchema = <TType extends string, TInput extends z.ZodType>(
  type: TType,
  input: TInput,
) => z.strictObject({ ...baseStepShape, type: z.literal(type), input });

const fieldReferenceSchema = z.looseObject({
  fieldMetadataUniversalIdentifier: z.uuid(),
  fieldMetadataId: z.never().optional(),
});

const stepFilterManifestSchema = stepFilterSchema
  .omit({ fieldMetadataId: true })
  .extend({ fieldMetadataUniversalIdentifier: z.uuid().optional() })
  .strict();

const recordObjectShape = { objectUniversalIdentifier: z.uuid() };

const functionStepSchema = <TType extends 'CODE' | 'LOGIC_FUNCTION'>(
  type: TType,
) =>
  z.strictObject({
    ...baseStepShape,
    type: z.literal(type),
    logicFunctionUniversalIdentifier: z.uuid(),
    input: z.record(z.string(), z.unknown()),
  });

export const workflowStepManifestSchema = z.discriminatedUnion('type', [
  functionStepSchema('CODE'),
  functionStepSchema('LOGIC_FUNCTION'),
  stepSchema('SEND_EMAIL', workflowSendEmailActionSettingsSchema.shape.input),
  stepSchema(
    'CREATE_CALENDAR_EVENT',
    workflowCreateCalendarEventActionSettingsSchema.shape.input,
  ),
  stepSchema(
    'HTTP_REQUEST',
    workflowHttpRequestActionSettingsSchema.shape.input,
  ),
  stepSchema('CLASSIFY', workflowClassifyActionSettingsSchema.shape.input),
  stepSchema('ITERATOR', workflowIteratorActionSettingsSchema.shape.input),
  stepSchema('DELAY', workflowDelayActionSettingsSchema.shape.input),
  stepSchema('EMPTY', workflowEmptyActionSettingsSchema.shape.input),
  stepSchema('DRAFT_EMAIL', workflowSendEmailActionSettingsSchema.shape.input),
  stepSchema(
    'CREATE_RECORD',
    workflowCreateRecordActionSettingsSchema.shape.input
      .omit({ objectName: true })
      .extend(recordObjectShape)
      .strict(),
  ),
  stepSchema(
    'UPDATE_RECORD',
    workflowUpdateRecordActionSettingsSchema.shape.input
      .omit({ objectName: true })
      .extend(recordObjectShape)
      .strict(),
  ),
  stepSchema(
    'UPSERT_RECORD',
    workflowUpsertRecordActionSettingsSchema.shape.input
      .omit({ objectName: true })
      .extend(recordObjectShape)
      .strict(),
  ),
  stepSchema(
    'DELETE_RECORD',
    workflowDeleteRecordActionSettingsSchema.shape.input
      .omit({ objectName: true })
      .extend(recordObjectShape)
      .strict(),
  ),
  stepSchema(
    'FIND_RECORDS',
    workflowFindRecordsActionSettingsSchema.shape.input
      .omit({ objectName: true, filter: true, orderBy: true })
      .extend({
        ...recordObjectShape,
        filter: z
          .strictObject({
            recordFilterGroups: z
              .array(z.record(z.string(), z.unknown()))
              .optional(),
            recordFilters: z.array(fieldReferenceSchema).optional(),
          })
          .optional(),
        orderBy: z
          .strictObject({
            recordSorts: z
              .array(
                fieldReferenceSchema.extend({
                  direction: z.enum(['ASC', 'DESC']),
                  subFieldName: z.string().nullable().optional(),
                }),
              )
              .optional(),
            gqlOperationOrderBy: z
              .array(z.record(z.string(), z.unknown()))
              .optional(),
          })
          .optional(),
      })
      .strict(),
  ),
  stepSchema(
    'PICK_RECORD',
    z
      .strictObject({
        ...recordObjectShape,
        strategy: workflowPickRecordStrategySchema,
        recordIds: z.array(z.string()),
        loadBalance: z
          .strictObject({
            objectUniversalIdentifier: z.uuid(),
            fieldUniversalIdentifier: z.uuid(),
          })
          .optional(),
      })
      .superRefine((input, context) => {
        if (input.strategy === 'LOAD_BALANCED' && !input.loadBalance) {
          context.addIssue({
            code: 'custom',
            path: ['loadBalance'],
            message: 'loadBalance is required when strategy is LOAD_BALANCED',
          });
        }
      }),
  ),
  stepSchema(
    'FILTER',
    workflowFilterActionSettingsSchema.shape.input.extend({
      stepFilters: z.array(stepFilterManifestSchema),
    }),
  ),
  stepSchema(
    'IF_ELSE',
    workflowIfElseActionSettingsSchema.shape.input.extend({
      stepFilters: z.array(stepFilterManifestSchema),
    }),
  ),
  stepSchema(
    'FORM',
    z.array(
      workflowFormActionSettingsSchema.shape.input.element
        .extend({ settings: z.record(z.string(), z.unknown()).optional() })
        .superRefine((field, context) => {
          if (
            field.type === 'RECORD' &&
            !z.uuid().safeParse(field.settings?.objectUniversalIdentifier)
              .success
          ) {
            context.addIssue({
              code: 'custom',
              path: ['settings', 'objectUniversalIdentifier'],
              message:
                'Record picker fields require an object universal identifier',
            });
          }
        }),
    ),
  ),
  stepSchema(
    'AI_AGENT',
    z.strictObject({
      agentUniversalIdentifier: z.uuid().optional(),
      prompt: z.string(),
    }),
  ),
]);

export type WorkflowStepManifest = z.infer<typeof workflowStepManifestSchema>;
