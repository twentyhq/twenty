import { Logger, Scope } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
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

    this.logger.log(
      `[WorkflowCleanWorkflowRunsJob] Starting job for workspace ${workspaceId}`,
    );

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const BATCH_SIZE = 200;
      let totalDeleted = 0;

      const oldRunsDeleted = await this.deleteOldRuns({
        schemaName,
        batchSize: BATCH_SIZE,
      });

      totalDeleted += oldRunsDeleted;

      const excessRunsDeleted = await this.deleteExcessRunsPerWorkflow({
        schemaName,
        batchSize: BATCH_SIZE,
      });

      totalDeleted += excessRunsDeleted;

      this.logger.log(
        `[WorkflowCleanWorkflowRunsJob] Deleted ${totalDeleted} workflow runs for workspace ${workspaceId}`,
      );
    }, authContext);
  }

  private async deleteOldRuns({
    schemaName,
    batchSize,
  }: {
    schemaName: string;
    batchSize: number;
  }): Promise<number> {
    let totalDeleted = 0;
    let deletedCount: number;

    do {
      const result = await this.dataSource.query(
        `
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (
            SELECT id FROM ${schemaName}."workflowRun"
            WHERE "createdAt" < NOW() - INTERVAL '${RUNS_TO_CLEAN_THRESHOLD_DAYS} days'
            LIMIT ${batchSize}
          )
          RETURNING id;
        `,
      );

      deletedCount = result[0].length;
      totalDeleted += deletedCount;
    } while (deletedCount > 0);

    return totalDeleted;
  }

  private async deleteExcessRunsPerWorkflow({
    schemaName,
    batchSize,
  }: {
    schemaName: string;
    batchSize: number;
  }): Promise<number> {
    let totalDeleted = 0;
    let deletedCount: number;

    do {
      const result = await this.dataSource.query(
        `
          WITH ranked_runs AS (
            SELECT id,
                   ROW_NUMBER() OVER (
                      PARTITION BY "workflowId"
                      ORDER BY "createdAt" DESC
                   ) AS rn
            FROM ${schemaName}."workflowRun"
            WHERE status IN ('${WorkflowRunStatus.COMPLETED}', '${WorkflowRunStatus.FAILED}')
          ),
          runs_to_delete AS (
            SELECT id FROM ranked_runs
            WHERE rn > ${NUMBER_OF_WORKFLOW_RUNS_TO_KEEP}
            LIMIT ${batchSize}
          )
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (SELECT id FROM runs_to_delete)
          RETURNING id;
        `,
      );

      deletedCount = result[0].length;
      totalDeleted += deletedCount;
    } while (deletedCount > 0);

    return totalDeleted;
  }
}
