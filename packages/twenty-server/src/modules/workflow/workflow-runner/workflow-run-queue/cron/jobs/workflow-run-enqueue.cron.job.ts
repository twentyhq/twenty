import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NOT_STARTED_RUNS_FIND_OPTIONS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/not-started-runs-find-options';
import {
  WorkflowRunEnqueueJob,
  WorkflowRunEnqueueJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-run-enqueue.job';

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '*/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueCronJob {
  private readonly logger = new Logger(WorkflowRunEnqueueCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowRunEnqueueCronJob.name)
  @SentryCronMonitor(
    WorkflowRunEnqueueCronJob.name,
    WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowRunEnqueueCronJob cron');

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    let enqueuedCount = 0;

    for (const workspace of activeWorkspaces) {
      try {
        const hasNotStartedRuns = await this.hasNotStartedRuns(workspace.id);

        if (hasNotStartedRuns) {
          await this.messageQueueService.add<WorkflowRunEnqueueJobData>(
            WorkflowRunEnqueueJob.name,
            {
              workspaceId: workspace.id,
              isCacheMode: false,
            },
          );
          enqueuedCount++;
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspace.id,
          },
        });
      }
    }

    this.logger.log(
      `Completed WorkflowRunEnqueueCronJob cron, enqueued ${enqueuedCount} jobs`,
    );
  }

  private async hasNotStartedRuns(workspaceId: string): Promise<boolean> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        return workflowRunRepository.exists({
          where: NOT_STARTED_RUNS_FIND_OPTIONS,
        });
      },
      authContext,
    );
  }
}
