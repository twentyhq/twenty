import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const createDraftFromWorkflowVersionSchema = z.object({
  workflowId: z.string().describe('The ID of the workflow'),
  workflowVersionIdToCopy: z
    .string()
    .describe('The ID of the workflow version to create a draft from'),
});

type CreateDraftFromWorkflowVersionInput = z.infer<
  typeof createDraftFromWorkflowVersionSchema
>;

export const createCreateDraftFromWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionService'>,
  context: WorkflowToolContext,
) => ({
  name: 'create_draft_from_workflow_version' as const,
  description:
    'Create a new draft workflow version from an existing one. This allows for iterative workflow development.',
  inputSchema: createDraftFromWorkflowVersionSchema,
  execute: async (parameters: CreateDraftFromWorkflowVersionInput) => {
    try {
      return await deps.workflowVersionService.createDraftFromWorkflowVersion({
        workspaceId: context.workspaceId,
        workflowId: parameters.workflowId,
        workflowVersionIdToCopy: parameters.workflowVersionIdToCopy,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create draft from workflow version: ${error.message}`,
      };
    }
  },
});
