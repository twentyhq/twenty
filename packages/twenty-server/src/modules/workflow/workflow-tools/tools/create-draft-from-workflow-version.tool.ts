import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const createDraftFromWorkflowVersionSchema = z.object({
  coreWorkflowId: z.string().uuid().describe('The core workflow UUID'),
  coreWorkflowVersionIdToCopy: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to create a draft from'),
});

type CreateDraftFromWorkflowVersionInput = z.infer<
  typeof createDraftFromWorkflowVersionSchema
>;

export const createCreateDraftFromWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'create_draft_from_workflow_version' as const,
  description:
    'Create a new draft workflow version from an existing one. This allows for iterative workflow development. Returns the new core workflow version.',
  inputSchema: createDraftFromWorkflowVersionSchema,
  execute: async (parameters: CreateDraftFromWorkflowVersionInput) => {
    try {
      const coreWorkflowVersion =
        await deps.coreWorkflowVersionMutationService.createDraftFromCoreWorkflowVersion(
          {
            workspaceId: context.workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            coreWorkflowId: parameters.coreWorkflowId,
            coreWorkflowVersionIdToCopy: parameters.coreWorkflowVersionIdToCopy,
          },
        );

      return {
        success: true,
        coreWorkflowVersionId: coreWorkflowVersion.id,
        coreWorkflowId: parameters.coreWorkflowId,
        status: coreWorkflowVersion.status,
        name: coreWorkflowVersion.label,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create draft from workflow version: ${error.message}`,
      };
    }
  },
});
