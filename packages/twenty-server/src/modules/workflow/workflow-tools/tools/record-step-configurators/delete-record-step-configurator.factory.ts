import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/schemas';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowToolContext } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type DeleteRecordStepConfiguratorDeps = {
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

export const createDeleteRecordStepConfiguratorTool = (
  deps: DeleteRecordStepConfiguratorDeps,
  context: WorkflowToolContext,
  objectMetadata: ObjectMetadataForToolSchema,
) => {
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
    name: `configure_delete_${objectMetadata.nameSingular}_step`,
    description:
      `Add a workflow step that deletes a ${objectMetadata.labelSingular} record. ` +
      `This performs a soft delete (marks as deleted but preserves data).`,
    inputSchema,
    execute: async (parameters: z.infer<typeof inputSchema>) => {
      try {
        const stepId = uuidv4();

        // First create the step shell
        await deps.workflowVersionStepService.createWorkflowVersionStep({
          workspaceId: context.workspaceId,
          input: {
            workflowVersionId: parameters.workflowVersionId,
            stepType: WorkflowActionType.DELETE_RECORD,
            parentStepId: parameters.parentStepId,
            id: stepId,
          },
        });

        // Then configure the step with full settings
        const stepConfig = {
          id: stepId,
          name: parameters.stepName || `Delete ${objectMetadata.labelSingular}`,
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
        };

        const result =
          await deps.workflowVersionStepService.updateWorkflowVersionStep({
            workspaceId: context.workspaceId,
            workflowVersionId: parameters.workflowVersionId,
            step: stepConfig,
          });

        return {
          success: true,
          message: `Created workflow step to delete ${objectMetadata.labelSingular}`,
          result: {
            stepId,
            step: result,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: `Failed to create ${objectMetadata.labelSingular} delete workflow step: ${error.message}`,
        };
      }
    },
  };
};
