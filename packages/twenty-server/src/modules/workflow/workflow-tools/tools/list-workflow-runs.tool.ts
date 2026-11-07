import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere } from 'typeorm';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const listWorkflowRunsSchema = z.object({
  coreWorkflowId: z
    .uuid()
    .optional()
    .describe(
      'Filter runs by the core workflow UUID they belong to, as returned by list_workflows',
    ),
  status: z
    .nativeEnum(WorkflowRunStatus)
    .optional()
    .describe(
      'Filter runs by status (e.g. FAILED to find runs that need troubleshooting)',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .describe(`Maximum number of runs to return (default ${DEFAULT_LIMIT})`),
});

@DefineTool({
  name: 'list_workflow_runs',
  category: ToolCategory.WORKFLOW,
  description:
    'List workflow runs, optionally filtered by core workflow and/or status, ordered from most to least recent. Use this to find the relevant run (for example the latest failed run of a workflow) before inspecting it in detail with get_workflow_run.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ListWorkflowRunsTool extends BaseTool<
  typeof listWorkflowRunsSchema
> {
  readonly inputSchema = listWorkflowRunsSchema;

  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof listWorkflowRunsSchema>): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('list_workflow_runs');
    }

    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            );

          const where: FindOptionsWhere<WorkflowRunWorkspaceEntity> = {};

          if (isDefined(parameters.coreWorkflowId)) {
            where.coreWorkflowId = parameters.coreWorkflowId;
          }

          if (isDefined(parameters.status)) {
            where.status = parameters.status;
          }

          const workflowRuns = await workflowRunRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: parameters.limit ?? DEFAULT_LIMIT,
          });

          return {
            success: true,
            message: `Found ${workflowRuns.length} workflow run(s)`,
            result: {
              workflowRuns: workflowRuns.map((workflowRun) => ({
                id: workflowRun.id,
                name: workflowRun.name,
                status: workflowRun.status,
                error: workflowRun.state?.workflowRunError,
                startedAt: workflowRun.startedAt,
                endedAt: workflowRun.endedAt,
                coreWorkflowId: workflowRun.coreWorkflowId,
                coreWorkflowVersionId: workflowRun.coreWorkflowVersionId,
              })),
            },
          };
        },
        context.authContext,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to list workflow runs: ${error.message}`,
      };
    }
  }
}
