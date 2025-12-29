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

export function buildCreateRecordStepTool(
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
