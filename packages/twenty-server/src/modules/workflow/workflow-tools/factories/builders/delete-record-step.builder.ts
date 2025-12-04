import { type ToolSet } from 'ai';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type ToolGeneratorContext } from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

import {
  createAndConfigureStep,
  type WorkflowStepToolsDeps,
} from './step-builder.utils';

export function buildDeleteRecordStepTool(
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
