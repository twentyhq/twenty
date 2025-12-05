import { type ToolSet } from 'ai';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import { type ToolGeneratorContext } from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

import {
  createAndConfigureStep,
  type WorkflowStepToolsDeps,
} from './step-builder.utils';

export function buildUpdateRecordStepTool(
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
