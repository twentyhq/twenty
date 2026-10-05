import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, In } from 'typeorm';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

const WORKFLOW_RUN_DELETION_BATCH_SIZE = 200;

@Injectable()
export class WorkflowDeletionCleanupWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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
    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const stillDeletedCoreWorkflowIds = coreWorkflowIds.filter(
      (coreWorkflowId) =>
        !isDefined(
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: coreWorkflowId,
            flatEntityMaps: flatWorkflowMaps,
          }),
        ),
    );

    if (stillDeletedCoreWorkflowIds.length === 0) {
      return;
    }

    await this.cancelWaitsOfRuns({
      workspaceId,
      coreWorkflowIds: stillDeletedCoreWorkflowIds,
    });
    await this.deleteRuns({
      workspaceId,
      coreWorkflowIds: stillDeletedCoreWorkflowIds,
    });
    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );
  }

  private async cancelWaitsOfRuns({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    const runsThatMayWait =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
              shouldBypassPermissionChecks: true,
            })
            .find({
              where: {
                coreWorkflowId: In(coreWorkflowIds),
                status: In([
                  WorkflowRunStatus.RUNNING,
                  WorkflowRunStatus.STOPPING,
                ]),
              },
              select: { id: true },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
      );

    for (const { id } of runsThatMayWait) {
      await this.workflowStepWaitWorkspaceService.cancelRunWaits({
        workspaceId,
        workflowRunId: id,
      });
    }
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
        [{ status: WorkflowRunStatus; deletedAt: Date | null }[], number]
      >(
        `
          DELETE FROM ${schemaName}."workflowRun"
          WHERE id IN (
            SELECT id FROM ${schemaName}."workflowRun"
            WHERE "coreWorkflowId" = ANY($1)
            LIMIT $2
          )
          RETURNING status, "deletedAt";
        `,
        [coreWorkflowIds, WORKFLOW_RUN_DELETION_BATCH_SIZE],
      );

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
