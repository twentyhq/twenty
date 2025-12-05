import { type ToolSet } from 'ai';
import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { ObjectRecordOrderBySchema } from 'src/engine/core-modules/record-crud/zod-schemas/order-by.zod-schema';
import { type ToolGeneratorContext } from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

import {
  createAndConfigureStep,
  type WorkflowStepToolsDeps,
} from './step-builder.utils';

export function buildFindRecordsStepTool(
  deps: WorkflowStepToolsDeps,
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields: RestrictedFieldsPermissions,
  context: ToolGeneratorContext,
): ToolSet {
  const filterShape: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (shouldExcludeFieldFromAgentToolSchema(field)) {
      return;
    }

    if (restrictedFields?.[field.id]?.canRead === false) {
      return;
    }

    const filterSchema = generateFieldFilterZodSchema(field);

    if (!filterSchema) {
      return;
    }

    const isManyToOneRelationField =
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings?.relationType === RelationType.MANY_TO_ONE;

    filterShape[isManyToOneRelationField ? `${field.name}Id` : field.name] =
      filterSchema;
  });

  const inputSchema = z.object({
    workflowVersionId: z
      .string()
      .describe('The ID of the workflow version to add the step to'),
    parentStepId: z
      .string()
      .optional()
      .describe('Optional ID of the parent step this step should come after'),
    stepName: z
      .string()
      .optional()
      .describe(
        `Name for this step (default: "Find ${objectMetadata.labelPlural}")`,
      ),
    limit: z
      .number()
      .int()
      .positive()
      .max(1000)
      .optional()
      .default(100)
      .describe('Maximum number of records to return (default: 100)'),
    orderBy: ObjectRecordOrderBySchema.optional().describe(
      'Sort records by field(s). Each item is an object with field name as key, sort direction as value.',
    ),
    filter: z
      .object(filterShape)
      .partial()
      .optional()
      .describe(
        `Filter criteria for ${objectMetadata.labelPlural}. Use {{trigger.fieldName}} or {{stepId.fieldName}} to reference dynamic values.`,
      ),
  });

  return {
    [`configure_find_${objectMetadata.namePlural}_step`]: {
      description:
        `Add a workflow step that searches for ${objectMetadata.labelPlural} records. ` +
        `Results can be used in subsequent steps via {{stepId.result}}.`,
      inputSchema,
      execute: async (parameters: z.infer<typeof inputSchema>) => {
        try {
          const filterConfig = parameters.filter
            ? {
                recordFilters: Object.entries(parameters.filter).map(
                  ([fieldName, filterValue]) => ({
                    fieldName,
                    filter: filterValue,
                  }),
                ),
              }
            : undefined;

          const { stepId, result } = await createAndConfigureStep(
            deps,
            context.workspaceId,
            parameters.workflowVersionId,
            WorkflowActionType.FIND_RECORDS,
            parameters.parentStepId,
            {
              name: parameters.stepName || `Find ${objectMetadata.labelPlural}`,
              type: WorkflowActionType.FIND_RECORDS,
              valid: true,
              settings: {
                input: {
                  objectName: objectMetadata.nameSingular,
                  limit: parameters.limit,
                  filter: filterConfig,
                  orderBy: parameters.orderBy
                    ? { gqlOperationOrderBy: parameters.orderBy }
                    : undefined,
                },
                outputSchema: {},
                errorHandlingOptions: {
                  retryOnFailure: { value: false },
                  continueOnFailure: { value: false },
                },
              },
            },
          );

          return {
            success: true,
            message: `Created workflow step to find ${objectMetadata.labelPlural}`,
            result: { stepId, step: result },
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create ${objectMetadata.labelPlural} find workflow step: ${error.message}`,
          };
        }
      },
    },
  };
}
