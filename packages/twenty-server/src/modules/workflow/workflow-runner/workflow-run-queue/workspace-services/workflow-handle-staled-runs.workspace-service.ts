import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';
import { getStuckStoppingRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-stopping-runs-find-options.util';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async handleStaledRunsForWorkspace(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          WorkflowRunWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const staledRunsCount = await workflowRunRepository.count({
        where: getStaledRunsFindOptions(),
      });

      if (staledRunsCount <= 0) {
        return;
      }

      const batchCount = Math.ceil(staledRunsCount / QUERY_MAX_RECORDS);

      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const staledWorkflowRuns = await workflowRunRepository.find({
          where: getStaledRunsFindOptions(),
          select: {
            id: true,
          },
          order: {
            createdAt: 'ASC',
          },
          take: QUERY_MAX_RECORDS,
        });

        if (staledWorkflowRuns.length <= 0) {
          break;
        }

        await workflowRunRepository.update(
          staledWorkflowRuns.map((workflowRun) => workflowRun.id),
          {
            enqueuedAt: null,
            status: WorkflowRunStatus.NOT_STARTED,
          },
        );
      }

      await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
        workspaceId,
      );
    }, authContext);
  }

  async handleStuckStoppingRunsForWorkspace(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    const stuckStoppingRunIds =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkflowRunWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          const findOptions = getStuckStoppingRunsFindOptions();

          const runIds: string[] = [];
          let page: WorkflowRunWorkspaceEntity[];

          do {
            page = await workflowRunRepository.find({
              where: findOptions,
              select: { id: true },
              order: { createdAt: 'ASC', id: 'ASC' },
              take: QUERY_MAX_RECORDS,
              skip: runIds.length,
            });

            runIds.push(...page.map((workflowRun) => workflowRun.id));
          } while (page.length === QUERY_MAX_RECORDS);

          return runIds;
        },
        authContext,
      );

    for (const workflowRunId of stuckStoppingRunIds) {
      try {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.STOPPED,
        });
      } catch (error) {
        this.logger.error(
          `Failed to finalize stuck stopping workflow run ${workflowRunId} for workspace ${workspaceId}`,
          error,
        );
      }
    }
  }
}
