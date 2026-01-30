import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const getWorkflowCurrentVersionSchema = z.object({
  workflowId: z
    .string()
    .describe('The ID of the workflow to get the current version for'),
});

type GetWorkflowCurrentVersionInput = z.infer<
  typeof getWorkflowCurrentVersionSchema
>;

export const createGetWorkflowCurrentVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'globalWorkspaceOrmManager'>,
  context: WorkflowToolContext,
) => ({
  name: 'get_workflow_current_version' as const,
  description:
    'Get the current version of a workflow. Returns the draft version if one exists, otherwise the last published version.',
  inputSchema: getWorkflowCurrentVersionSchema,
  execute: async (parameters: GetWorkflowCurrentVersionInput) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);

      return await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRepository =
            await deps.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              context.workspaceId,
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          const workflow = await workflowRepository.findOne({
            where: { id: parameters.workflowId },
          });

          if (!isDefined(workflow)) {
            return {
              success: false,
              error: `Workflow ${parameters.workflowId} not found`,
            };
          }

          const workflowVersionRepository =
            await deps.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
              context.workspaceId,
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          const versions = await workflowVersionRepository.find({
            where: [
              {
                workflowId: parameters.workflowId,
                status: WorkflowVersionStatus.DRAFT,
              },
              {
                workflowId: parameters.workflowId,
                status: WorkflowVersionStatus.ACTIVE,
              },
            ],
          });

          const draftVersion = versions.find(
            (version) => version.status === WorkflowVersionStatus.DRAFT,
          );
          const activeVersion = versions.find(
            (version) => version.status === WorkflowVersionStatus.ACTIVE,
          );

          const currentVersion = draftVersion ?? activeVersion;

          if (!isDefined(currentVersion)) {
            return {
              success: false,
              error: `Workflow ${parameters.workflowId} has no draft or active version`,
            };
          }

          return {
            success: true,
            workflowVersion: {
              id: currentVersion.id,
              name: currentVersion.name,
              status: currentVersion.status,
              trigger: currentVersion.trigger,
              steps: currentVersion.steps,
              workflowId: currentVersion.workflowId,
            },
          };
        },
        authContext,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to get workflow current version: ${error.message}`,
      };
    }
  },
});
