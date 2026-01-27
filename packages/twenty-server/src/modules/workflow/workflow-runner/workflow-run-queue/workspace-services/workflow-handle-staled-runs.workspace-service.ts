import { Injectable, Logger } from '@nestjs/common';

import { IsNull, LessThan, Or } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
  ) {}

  async handleStaledRuns({ workspaceIds }: { workspaceIds: string[] }) {
    this.logger.log('Starting handleStaledRuns');

    try {
      for (let i = 0; i < workspaceIds.length; i++) {
        const workspaceId = workspaceIds[i];

        this.logger.log(
          `Processing workspace ${workspaceId} (${i + 1}/${workspaceIds.length})`,
        );

        try {
          await this.handleStaledRunsForWorkspace(workspaceId);
        } catch (error) {
          this.logger.error(
            `Failed to handle staled runs for workspace ${workspaceId}`,
            error,
          );
        }
      }

      this.logger.log('Completed handleStaledRuns');
    } catch (error) {
      this.logger.error('handleStaledRuns failed', error);
      throw error;
    }
  }

  private async handleStaledRunsForWorkspace(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          WorkflowRunWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const staledWorkflowRuns = await workflowRunRepository.find({
        where: {
          status: WorkflowRunStatus.ENQUEUED,
          enqueuedAt: Or(LessThan(oneHourAgo), IsNull()),
        },
      });

      if (staledWorkflowRuns.length <= 0) {
        return;
      }

      await workflowRunRepository.update(
        staledWorkflowRuns.map((workflowRun) => workflowRun.id),
        {
          enqueuedAt: null,
          status: WorkflowRunStatus.NOT_STARTED,
        },
      );

      await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
        workspaceId,
      );
    }, authContext);
  }
}
