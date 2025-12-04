import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { type ToolSet } from 'ai';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { ObjectRecordOrderBySchema } from 'src/engine/core-modules/record-crud/zod-schemas/order-by.zod-schema';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import {
  type ObjectWithPermission,
  type ToolGeneratorContext,
} from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Dependencies required by the workflow step tools factory
export type WorkflowStepToolsDeps = {
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

// Creates the factory function with injected dependencies
export const createWorkflowStepToolsFactory = (deps: WorkflowStepToolsDeps) => {
  return (
    {
      objectMetadata,
      restrictedFields,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
    }: ObjectWithPermission,
    context: ToolGeneratorContext,
  ): ToolSet => {
    const tools: ToolSet = {};

    if (canCreate) {
      Object.assign(
        tools,
        buildCreateRecordStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canUpdate) {
      Object.assign(
        tools,
        buildUpdateRecordStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canRead) {
      Object.assign(
        tools,
        buildFindRecordsStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canDelete) {
      Object.assign(
        tools,
        buildDeleteRecordStepTool(deps, objectMetadata, context),
      );
    }

    return tools;
  };
};

// Helper to create and configure a workflow step
async function createAndConfigureStep(
  deps: WorkflowStepToolsDeps,
  workspaceId: string,
  workflowVersionId: string,
  stepType: WorkflowActionType,
  parentStepId: string | undefined,
  stepConfig: object,
) {
  const stepId = uuidv4();

  await deps.workflowVersionStepService.createWorkflowVersionStep({
    workspaceId,
    input: {
      workflowVersionId,
      stepType,
      parentStepId,
      id: stepId,
    },
  });

  const result =
    await deps.workflowVersionStepService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      step: { id: stepId, ...stepConfig },
    });

  return { stepId, result };
}

// Build CREATE record step tool
function buildCreateRecordStepTool(
  deps: WorkflowStepToolsDeps,
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields: RestrictedFieldsPermissions,
  context: ToolGeneratorContext,
): ToolSet {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  );

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
        `Name for this step (default: "Create ${objectMetadata.labelSingular}")`,
      ),
    input: recordPropertiesSchema.describe(
      `The ${objectMetadata.labelSingular} record data. Use {{trigger.fieldName}} or {{stepId.fieldName}} syntax to reference dynamic values from previous steps.`,
    ),
  });

  return {
    [`configure_create_${objectMetadata.nameSingular}_step`]: {
      description:
        `Add a workflow step that creates a ${objectMetadata.labelSingular} record. ` +
        `Provide the record fields directly - use {{trigger.fieldName}} or {{stepId.fieldName}} to reference values from previous steps.`,
      inputSchema,
      execute: async (parameters: z.infer<typeof inputSchema>) => {
        try {
          const { stepId, result } = await createAndConfigureStep(
            deps,
            context.workspaceId,
            parameters.workflowVersionId,
            WorkflowActionType.CREATE_RECORD,
            parameters.parentStepId,
            {
              name:
                parameters.stepName || `Create ${objectMetadata.labelSingular}`,
              type: WorkflowActionType.CREATE_RECORD,
              valid: true,
              settings: {
                input: {
                  objectName: objectMetadata.nameSingular,
                  objectRecord: parameters.input,
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
            message: `Created workflow step to create ${objectMetadata.labelSingular}`,
            result: { stepId, step: result },
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create ${objectMetadata.labelSingular} workflow step: ${error.message}`,
          };
        }
      },
    },
  };
}

// Build UPDATE record step tool
function buildUpdateRecordStepTool(
  deps: WorkflowStepToolsDeps,
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields: RestrictedFieldsPermissions,
  context: ToolGeneratorContext,
): ToolSet {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  );
  const updateSchema = recordPropertiesSchema.partial();

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
        `Name for this step (default: "Update ${objectMetadata.labelSingular}")`,
      ),
    objectRecordId: z
      .string()
      .describe(
        `The ID of the ${objectMetadata.labelSingular} record to update. Use {{trigger.id}} or {{stepId.result.id}} to reference a dynamic ID.`,
      ),
    fieldsToUpdate: updateSchema.describe(
      `The fields to update on the ${objectMetadata.labelSingular} record. Only include fields you want to change. Use {{trigger.fieldName}} or {{stepId.fieldName}} to reference dynamic values.`,
    ),
  });

  return {
    [`configure_update_${objectMetadata.nameSingular}_step`]: {
      description:
        `Add a workflow step that updates an existing ${objectMetadata.labelSingular} record. ` +
        `Specify the record ID and only the fields you want to update.`,
      inputSchema,
      execute: async (parameters: z.infer<typeof inputSchema>) => {
        try {
          const { stepId, result } = await createAndConfigureStep(
            deps,
            context.workspaceId,
            parameters.workflowVersionId,
            WorkflowActionType.UPDATE_RECORD,
            parameters.parentStepId,
            {
              name:
                parameters.stepName || `Update ${objectMetadata.labelSingular}`,
              type: WorkflowActionType.UPDATE_RECORD,
              valid: true,
              settings: {
                input: {
                  objectName: objectMetadata.nameSingular,
                  objectRecordId: parameters.objectRecordId,
                  objectRecord: parameters.fieldsToUpdate,
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
            message: `Created workflow step to update ${objectMetadata.labelSingular}`,
            result: { stepId, step: result },
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create ${objectMetadata.labelSingular} update workflow step: ${error.message}`,
          };
        }
      },
    },
  };
}

// Build FIND records step tool
function buildFindRecordsStepTool(
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

// Build DELETE record step tool
function buildDeleteRecordStepTool(
  deps: WorkflowStepToolsDeps,
  objectMetadata: ObjectMetadataForToolSchema,
  context: ToolGeneratorContext,
): ToolSet {
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
        `Name for this step (default: "Delete ${objectMetadata.labelSingular}")`,
      ),
    objectRecordId: z
      .string()
      .describe(
        `The ID of the ${objectMetadata.labelSingular} record to delete. Use {{trigger.id}} or {{stepId.result.id}} to reference a dynamic ID.`,
      ),
  });

  return {
    [`configure_delete_${objectMetadata.nameSingular}_step`]: {
      description:
        `Add a workflow step that deletes a ${objectMetadata.labelSingular} record. ` +
        `This performs a soft delete (marks as deleted but preserves data).`,
      inputSchema,
      execute: async (parameters: z.infer<typeof inputSchema>) => {
        try {
          const { stepId, result } = await createAndConfigureStep(
            deps,
            context.workspaceId,
            parameters.workflowVersionId,
            WorkflowActionType.DELETE_RECORD,
            parameters.parentStepId,
            {
              name:
                parameters.stepName || `Delete ${objectMetadata.labelSingular}`,
              type: WorkflowActionType.DELETE_RECORD,
              valid: true,
              settings: {
                input: {
                  objectName: objectMetadata.nameSingular,
                  objectRecordId: parameters.objectRecordId,
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
            message: `Created workflow step to delete ${objectMetadata.labelSingular}`,
            result: { stepId, step: result },
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create ${objectMetadata.labelSingular} delete workflow step: ${error.message}`,
          };
        }
      },
    },
  };
}
