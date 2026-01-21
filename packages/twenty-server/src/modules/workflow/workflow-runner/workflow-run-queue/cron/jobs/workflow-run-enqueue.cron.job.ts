import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '*/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueCronJob {
  private readonly logger = new Logger(WorkflowRunEnqueueCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workflowRunEnqueueWorkspaceService: WorkflowRunEnqueueWorkspaceService,
  ) {}

  @Process(WorkflowRunEnqueueCronJob.name)
  @SentryCronMonitor(
    WorkflowRunEnqueueCronJob.name,
    WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowRunEnqueueCronJob cron');

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
          await this.workflowRunEnqueueWorkspaceService.enqueueRunsForWorkspace(
            {
              workspaceId: workspace.id,
              isCacheMode: false,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to enqueue runs for workspace ${workspace.id}`,
            error,
          );
        }
      }

      this.logger.log('Completed WorkflowRunEnqueueCronJob cron');
    } catch (error) {
      this.logger.error('WorkflowRunEnqueueCronJob cron failed', error);
      throw error;
    }
  }
}
