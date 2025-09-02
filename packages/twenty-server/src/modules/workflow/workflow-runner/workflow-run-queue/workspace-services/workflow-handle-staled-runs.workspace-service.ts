import { Injectable } from '@nestjs/common';

import { IsNull, LessThan, Or } from 'typeorm';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
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

        await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
          workspaceId,
        );
      } catch (error) {
        console.error(
          'Failed to handle staled runs for workspace',
          workspaceId,
          error,
        );
      }
    }
  }
}
