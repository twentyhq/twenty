import { Injectable, Logger } from '@nestjs/common';

import { IsNull, LessThan, Or } from 'typeorm';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowNotStartedRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-not-started-runs.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowNotStartedRunsWorkspaceService: WorkflowNotStartedRunsWorkspaceService,
  ) {}

  async handleStaledRuns({ workspaceIds }: { workspaceIds: string[] }) {
    for (const workspaceId of workspaceIds) {
      try {
        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
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
          continue;
        }

        await workflowRunRepository.update(
          staledWorkflowRuns.map((workflowRun) => workflowRun.id),
          {
            enqueuedAt: null,
            status: WorkflowRunStatus.NOT_STARTED,
          },
        );

        await this.workflowNotStartedRunsWorkspaceService.recomputeWorkflowRunNotStartedCount(
          workspaceId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to handle staled runs for workspace: ${workspaceId}`,
          error,
        );
      }
    }
  }
}
