import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/schemas';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { ObjectRecordOrderBySchema } from 'src/engine/core-modules/record-crud/zod-schemas/order-by.zod-schema';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowToolContext } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type FindRecordsStepConfiguratorDeps = {
  workflowVersionStepService: {
    createWorkflowVersionStep: (args: {
      workspaceId: string;
      input: {
        workflowVersionId: string;
        stepType: WorkflowActionType;
        parentStepId?: string;
        id?: string;
      };
    }) => Promise<unknown>;
    updateWorkflowVersionStep: (args: {
      workspaceId: string;
      workflowVersionId: string;
      step: unknown;
    }) => Promise<unknown>;
  };
};

export const createFindRecordsStepConfiguratorTool = (
  deps: FindRecordsStepConfiguratorDeps,
  context: WorkflowToolContext,
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  // Build filter shape based on object fields
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
    name: `configure_find_${objectMetadata.namePlural}_step`,
    description:
      `Add a workflow step that searches for ${objectMetadata.labelPlural} records. ` +
      `Results can be used in subsequent steps via {{stepId.result}}.`,
    inputSchema,
    execute: async (parameters: z.infer<typeof inputSchema>) => {
      try {
        const stepId = uuidv4();

        // First create the step shell
        await deps.workflowVersionStepService.createWorkflowVersionStep({
          workspaceId: context.workspaceId,
          input: {
            workflowVersionId: parameters.workflowVersionId,
            stepType: WorkflowActionType.FIND_RECORDS,
            parentStepId: parameters.parentStepId,
            id: stepId,
          },
        });

        // Build the filter structure for workflow step
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

        // Then configure the step with full settings
        const stepConfig = {
          id: stepId,
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
        };

        const result =
          await deps.workflowVersionStepService.updateWorkflowVersionStep({
            workspaceId: context.workspaceId,
            workflowVersionId: parameters.workflowVersionId,
            step: stepConfig,
          });

        return {
          success: true,
          message: `Created workflow step to find ${objectMetadata.labelPlural}`,
          result: {
            stepId,
            step: result,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: `Failed to create ${objectMetadata.labelPlural} find workflow step: ${error.message}`,
        };
      }
    },
  };
};
