import { Logger, Scope } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';
import { RUNS_TO_CLEAN_THRESHOLD_DAYS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/runs-to-clean-threshold';

export type WorkflowCleanWorkflowRunsJobData = {
  workspaceId: string;
};

type WorkflowRunsDeletionContext = {
  workspaceId: string;
  schemaName: string;
  workflowRunObjectMetadataId: string | undefined;
  batchSize: number;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowCleanWorkflowRunsJob {
  private readonly logger = new Logger(WorkflowCleanWorkflowRunsJob.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const workflowRunObjectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ]?.id;

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const deletionContext: WorkflowRunsDeletionContext = {
        workspaceId,
        schemaName,
        workflowRunObjectMetadataId,
        batchSize: 200,
      };
      let totalDeleted = 0;

      const oldRunsDeleted = await this.deleteOldRuns(deletionContext);

      totalDeleted += oldRunsDeleted;

      const excessRunsDeleted =
        await this.deleteExcessRunsPerWorkflow(deletionContext);

      totalDeleted += excessRunsDeleted;

      this.logger.log(
        `[WorkflowCleanWorkflowRunsJob] Deleted ${totalDeleted} workflow runs for workspace ${workspaceId}`,
      );
    }, authContext);
  }

  private async deleteOldRuns(
    deletionContext: WorkflowRunsDeletionContext,
  ): Promise<number> {
    const { schemaName, batchSize } = deletionContext;
    let totalDeleted = 0;
    let deletedCount: number;

    do {
      deletedCount = await this.deleteRunBatchWithRecordShares({
        deletionContext,
        query: `
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (
            SELECT id FROM ${schemaName}."workflowRun"
            WHERE status IN ($1, $2)
              AND "createdAt" < NOW() - MAKE_INTERVAL(days => $3)
            LIMIT $4
          )
          RETURNING id;
        `,
        parameters: [
          WorkflowRunStatus.COMPLETED,
          WorkflowRunStatus.FAILED,
          RUNS_TO_CLEAN_THRESHOLD_DAYS,
          batchSize,
        ],
      });
      totalDeleted += deletedCount;
    } while (deletedCount > 0);

    return totalDeleted;
  }

  private async deleteExcessRunsPerWorkflow(
    deletionContext: WorkflowRunsDeletionContext,
  ): Promise<number> {
    const { schemaName, batchSize } = deletionContext;
    let totalDeleted = 0;
    let deletedCount: number;

    do {
      deletedCount = await this.deleteRunBatchWithRecordShares({
        deletionContext,
        query: `
          WITH ranked_runs AS (
            SELECT id,
                   ROW_NUMBER() OVER (
                      PARTITION BY COALESCE("coreWorkflowId", "workflowId")
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
        parameters: [
          WorkflowRunStatus.COMPLETED,
          WorkflowRunStatus.FAILED,
          NUMBER_OF_WORKFLOW_RUNS_TO_KEEP,
          batchSize,
        ],
      });
      totalDeleted += deletedCount;
    } while (deletedCount > 0);

    return totalDeleted;
  }

  // Runs deleted here bypass the ORM, so their grants must be dropped alongside
  private async deleteRunBatchWithRecordShares({
    deletionContext: { workspaceId, workflowRunObjectMetadataId },
    query,
    parameters,
  }: {
    deletionContext: WorkflowRunsDeletionContext;
    query: string;
    parameters: unknown[];
  }): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      // TypeORM's query() for DELETE ... RETURNING returns a tuple [rows, affectedCount]
      const [deletedRuns]: [{ id: string }[], number] = await manager.query(
        query,
        parameters,
      );

      if (isDefined(workflowRunObjectMetadataId)) {
        await this.recordShareStorageService.deleteByRecordIdsInTransaction({
          workspaceId,
          objectMetadataId: workflowRunObjectMetadataId,
          recordIds: deletedRuns.map(({ id }) => id),
          manager,
        });
      }

      return deletedRuns.length;
    });
  }
}
