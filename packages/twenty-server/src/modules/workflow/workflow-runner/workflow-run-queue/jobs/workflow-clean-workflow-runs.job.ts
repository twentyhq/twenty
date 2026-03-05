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
            WHERE status IN ($1, $2)
              AND "createdAt" < NOW() - MAKE_INTERVAL(days => $3)
            LIMIT $4
          )
          RETURNING id;
        `,
        [
          WorkflowRunStatus.COMPLETED,
          WorkflowRunStatus.FAILED,
          RUNS_TO_CLEAN_THRESHOLD_DAYS,
          batchSize,
        ],
      );

      // TypeORM's dataSource.query() for for DELETE ... RETURNING returns a tuple [rows, affectedCount]
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
            WHERE status IN ($1, $2)
          ),
          runs_to_delete AS (
            SELECT id FROM ranked_runs
            WHERE rn > $3
            LIMIT $4
          )
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (SELECT id FROM runs_to_delete)
          RETURNING id;
        `,
        [
          WorkflowRunStatus.COMPLETED,
          WorkflowRunStatus.FAILED,
          NUMBER_OF_WORKFLOW_RUNS_TO_KEEP,
          batchSize,
        ],
      );

      // TypeORM's dataSource.query() for for DELETE ... RETURNING returns a tuple [rows, affectedCount]
      deletedCount = result[0].length;
      totalDeleted += deletedCount;
    } while (deletedCount > 0);

    return totalDeleted;
  }
}
