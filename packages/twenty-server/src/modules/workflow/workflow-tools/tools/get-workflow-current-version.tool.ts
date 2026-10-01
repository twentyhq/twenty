import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const getWorkflowCurrentVersionSchema = z.object({
  coreWorkflowId: z
    .string()
    .uuid()
    .describe(
      'The core workflow UUID to get the current version for, as returned by list_workflows',
    ),
});

type GetWorkflowCurrentVersionInput = z.infer<
  typeof getWorkflowCurrentVersionSchema
>;

export const createGetWorkflowCurrentVersionTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'coreWorkflowListService' | 'coreWorkflowVersionListService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'get_workflow_current_version' as const,
  description:
    'Get the current version of a workflow. Returns the draft version if one exists, otherwise the last published version. Returns a core workflow version ID (coreWorkflowVersionId), which the editing tools expect.',
  inputSchema: getWorkflowCurrentVersionSchema,
  execute: async (parameters: GetWorkflowCurrentVersionInput) => {
    try {
      const { workspaceId } = context;
      const { coreWorkflowId } = parameters;

      const coreWorkflow = await deps.coreWorkflowListService.findOneById({
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowId,
      });

      if (!isDefined(coreWorkflow)) {
        return {
          success: false,
          error: `Workflow ${coreWorkflowId} not found`,
        };
      }

      const coreWorkflowVersions =
        await deps.coreWorkflowVersionListService.findManyByCoreWorkflowId({
          workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowId,
        });

      const currentVersion =
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.DRAFT,
        ) ??
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.ACTIVE,
        ) ??
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.DEACTIVATED,
        );

      if (!isDefined(currentVersion)) {
        return {
          success: false,
          error: `Workflow ${coreWorkflowId} has no draft, active or deactivated version`,
        };
      }

      const coreWorkflowVersion =
        await deps.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId(
          {
            workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            coreWorkflowVersionId: currentVersion.id,
          },
        );

      if (!isDefined(coreWorkflowVersion)) {
        return {
          success: false,
          error: `Workflow version ${currentVersion.id} not found`,
        };
      }

      return {
        success: true,
        workflowVersion: {
          coreWorkflowVersionId: coreWorkflowVersion.id,
          name: coreWorkflowVersion.label,
          status: coreWorkflowVersion.status,
          trigger: coreWorkflowVersion.trigger,
          steps: coreWorkflowVersion.steps,
          coreWorkflowId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to get workflow current version: ${error.message}`,
      };
    }
  },
});
