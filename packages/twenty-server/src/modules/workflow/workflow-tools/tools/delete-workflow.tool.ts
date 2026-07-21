import { z } from 'zod';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { isDefined } from 'twenty-shared/utils';

type DeleteWorkflowToolContext = WorkflowToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};

const deleteWorkflowSchema = z.object({
  workflowId: z.string().uuid().describe('The UUID of the workflow to delete'),
});

type DeleteWorkflowInput = z.infer<typeof deleteWorkflowSchema>;

export const createDeleteWorkflowTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'globalWorkspaceOrmManager' | 'workflowCommonService'
  >,
  context: DeleteWorkflowToolContext,
) => ({
  name: 'delete_workflow' as const,
  description:
    'Delete a workflow by its ID. This also removes its versions, runs and automated triggers, and deactivates any active version. Use list_workflows to find the workflowId.',
  inputSchema: deleteWorkflowSchema,
  execute: async (parameters: DeleteWorkflowInput) => {
    try {
      const { workflowId } = parameters;
      const { workspaceId } = context;

      const authContext = buildSystemAuthContext(workspaceId);

      const deleteResult =
        await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workflowRepository =
              await deps.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
                workspaceId,
                'workflow',
                context.rolePermissionConfig,
              );

            return workflowRepository.softDelete(workflowId);
          },
          authContext,
        );

      if (!isDefined(deleteResult.affected)) {
        return {
          success: false,
          error: 'Workflow not found',
          message: `No workflow found with ID ${workflowId}`,
        };
      }

      await deps.workflowCommonService.handleWorkflowSubEntities({
        workflowIds: [workflowId],
        workspaceId,
        operation: 'delete',
      });

      return {
        success: true,
        message: `Successfully deleted workflow ${workflowId}`,
        workflowId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete workflow: ${errorMessage}`,
      };
    }
  },
});
