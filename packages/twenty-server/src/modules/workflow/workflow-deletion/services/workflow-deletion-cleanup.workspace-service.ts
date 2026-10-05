import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

const WORKFLOW_RUN_DELETION_BATCH_SIZE = 200;

const WAITING_WORKFLOW_RUN_STATUSES = [
  WorkflowRunStatus.RUNNING,
  WorkflowRunStatus.STOPPING,
];

@Injectable()
export class WorkflowDeletionCleanupWorkspaceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
  ) {}

  async cleanUpDeletedWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    await this.deleteRuns({ workspaceId, coreWorkflowIds });
    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );
  }

  private async deleteRuns({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    let removedNotStartedRunCount = 0;
    let deletedRunCount: number;

    do {
      const [deletedRuns] = await this.dataSource.query<
        [
          { id: string; status: WorkflowRunStatus; deletedAt: Date | null }[],
          number,
        ]
      >(
        `
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (
            SELECT id FROM ${schemaName}."workflowRun"
            WHERE "coreWorkflowId" = ANY($1)
            LIMIT $2
          )
          RETURNING id, status, "deletedAt";
        `,
        [coreWorkflowIds, WORKFLOW_RUN_DELETION_BATCH_SIZE],
      );

      for (const { id, status } of deletedRuns) {
        if (WAITING_WORKFLOW_RUN_STATUSES.includes(status)) {
          await this.workflowStepWaitWorkspaceService.cancelRunWaits({
            workspaceId,
            workflowRunId: id,
          });
        }
      }

      deletedRunCount = deletedRuns.length;
      removedNotStartedRunCount += deletedRuns.filter(
        ({ status, deletedAt }) =>
          status === WorkflowRunStatus.NOT_STARTED && !isDefined(deletedAt),
      ).length;
    } while (deletedRunCount > 0);

    if (removedNotStartedRunCount > 0) {
      await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
        workspaceId,
        removedNotStartedRunCount,
      );
    }
  }
}
