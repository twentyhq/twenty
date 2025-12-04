import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import {
  generateRecordPropertiesZodSchema,
  type ObjectMetadataForToolSchema,
} from 'src/engine/core-modules/record-crud/schemas';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowToolContext } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type CreateRecordStepConfiguratorDeps = {
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

export const createCreateRecordStepConfiguratorTool = (
  deps: CreateRecordStepConfiguratorDeps,
  context: WorkflowToolContext,
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
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
    name: `configure_create_${objectMetadata.nameSingular}_step`,
    description:
      `Add a workflow step that creates a ${objectMetadata.labelSingular} record. ` +
      `Provide the record fields directly - use {{trigger.fieldName}} or {{stepId.fieldName}} to reference values from previous steps.`,
    inputSchema,
    execute: async (parameters: z.infer<typeof inputSchema>) => {
      try {
        const stepId = uuidv4();

        // First create the step shell
        await deps.workflowVersionStepService.createWorkflowVersionStep({
          workspaceId: context.workspaceId,
          input: {
            workflowVersionId: parameters.workflowVersionId,
            stepType: WorkflowActionType.CREATE_RECORD,
            parentStepId: parameters.parentStepId,
            id: stepId,
          },
        });

        // Then configure the step with full settings
        const stepConfig = {
          id: stepId,
          name: parameters.stepName || `Create ${objectMetadata.labelSingular}`,
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
        };

        const result =
          await deps.workflowVersionStepService.updateWorkflowVersionStep({
            workspaceId: context.workspaceId,
            workflowVersionId: parameters.workflowVersionId,
            step: stepConfig,
          });

        return {
          success: true,
          message: `Created workflow step to create ${objectMetadata.labelSingular}`,
          result: {
            stepId,
            step: result,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: `Failed to create ${objectMetadata.labelSingular} workflow step: ${error.message}`,
        };
      }
    },
  };
};
