import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

export const WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowHandleStaledRunsJob {
  private readonly logger = new Logger(WorkflowHandleStaledRunsJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workflowHandleStaledRunsWorkspaceService: WorkflowHandleStaledRunsWorkspaceService,
  ) {}

  @Process(WorkflowHandleStaledRunsJob.name)
  @SentryCronMonitor(
    WorkflowHandleStaledRunsJob.name,
    WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowHandleStaledRunsJob cron');

    try {
      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });

      for (let i = 0; i < activeWorkspaces.length; i++) {
        const workspace = activeWorkspaces[i];

        this.logger.log(
          `Processing workspace ${workspace.id} (${i + 1}/${activeWorkspaces.length})`,
        );

        try {
          await this.workflowHandleStaledRunsWorkspaceService.handleStaledRuns({
            workspaceIds: [workspace.id],
          });
        } catch (error) {
          this.logger.error(
            `Failed to handle staled runs for workspace ${workspace.id}`,
            error,
          );
        }
      }

      this.logger.log('Completed WorkflowHandleStaledRunsJob cron');
    } catch (error) {
      this.logger.error('WorkflowHandleStaledRunsJob cron failed', error);
      throw error;
    }
  }
}
