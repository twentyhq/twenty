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
import {
  WorkflowHandleStaledRunsJob,
  WorkflowHandleStaledRunsJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-handle-staled-runs.job';
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';

export const WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowHandleStaledRunsCronJob {
  private readonly logger = new Logger(WorkflowHandleStaledRunsCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowHandleStaledRunsCronJob.name)
  @SentryCronMonitor(
    WorkflowHandleStaledRunsCronJob.name,
    WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowHandleStaledRunsCronJob cron');

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    let enqueuedCount = 0;

    for (const workspace of activeWorkspaces) {
      try {
        const hasStaledRuns = await this.hasStaledRuns(workspace.id);

        if (hasStaledRuns) {
          await this.messageQueueService.add<WorkflowHandleStaledRunsJobData>(
            WorkflowHandleStaledRunsJob.name,
            {
              workspaceId: workspace.id,
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
      `Completed WorkflowHandleStaledRunsCronJob cron, enqueued ${enqueuedCount} jobs`,
    );
  }

  private async hasStaledRuns(workspaceId: string): Promise<boolean> {
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
          where: getStaledRunsFindOptions(),
        });
      },
      authContext,
    );
  }
}
