import { Logger, Scope } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';
import { RUNS_TO_CLEAN_THRESHOLD_DAYS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/runs-to-clean-threshold';

export type WorkflowCleanWorkflowRunsJobData = {
  workspaceId: string;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowCleanWorkflowRunsJob {
  private readonly logger = new Logger(WorkflowCleanWorkflowRunsJob.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Process(WorkflowCleanWorkflowRunsJob.name)
  async handle({
    workspaceId,
  }: WorkflowCleanWorkflowRunsJobData): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunsToDelete = await this.dataSource.query(
        `
          WITH ranked_runs AS (
            SELECT id,
                   ROW_NUMBER() OVER (
                      PARTITION BY "workflowId"
                      ORDER BY "createdAt" DESC
                   ) AS rn,
                   "createdAt"
            FROM ${schemaName}."workflowRun"
            WHERE status IN ('${WorkflowRunStatus.COMPLETED}', '${WorkflowRunStatus.FAILED}')
          )
          SELECT id, rn FROM ranked_runs
          WHERE rn > ${NUMBER_OF_WORKFLOW_RUNS_TO_KEEP}
             OR "createdAt" < NOW() - INTERVAL '${RUNS_TO_CLEAN_THRESHOLD_DAYS} days';
        `,
      );

      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          WorkflowRunWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      for (const workflowRunToDelete of workflowRunsToDelete) {
        await workflowRunRepository.delete(workflowRunToDelete.id);
      }

      this.logger.log(
        `Deleted ${workflowRunsToDelete.length} workflow runs for workspace ${workspaceId}`,
      );
    }, authContext);
  }
}
