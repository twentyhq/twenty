import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { LessThan, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

export const WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowHandleStaledRunsJob {
  private readonly logger = new Logger(WorkflowHandleStaledRunsJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(WorkflowHandleStaledRunsJob.name)
  @SentryCronMonitor(
    WorkflowHandleStaledRunsJob.name,
    WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            activeWorkspace.id,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const oldWorkflowRuns = await workflowRunRepository.find({
          where: {
            status: WorkflowRunStatus.ENQUEUED,
            enqueuedAt: LessThan(oneHourAgo),
          },
        });

        if (oldWorkflowRuns.length <= 0) {
          continue;
        }

        await workflowRunRepository.update(
          oldWorkflowRuns.map((workflowRun) => workflowRun.id),
          {
            enqueuedAt: null,
            status: WorkflowRunStatus.NOT_STARTED,
          },
        );

        await this.workflowRunQueueWorkspaceService.decreaseWorkflowRunQueuedCount(
          activeWorkspace.id,
          oldWorkflowRuns.length,
        );
      } catch (error) {
        this.logger.error(
          `Error dequeuing workflow runs for workspace ${activeWorkspace.id}`,
          error,
        );
      }
    }
  }
}
