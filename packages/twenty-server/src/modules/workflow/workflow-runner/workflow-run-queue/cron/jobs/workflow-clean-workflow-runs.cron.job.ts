import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

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
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';
import {
  WorkflowCleanWorkflowRunsJob,
  WorkflowCleanWorkflowRunsJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';
import { getRunsToCleanFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-runs-to-clean-find-options.util';

export const CLEAN_WORKFLOW_RUN_CRON_PATTERN = '0 0 * * *';

const WORKSPACE_BATCH_SIZE = 50;

@Processor(MessageQueue.cronQueue)
export class WorkflowCleanWorkflowRunsCronJob {
  private readonly logger = new Logger(WorkflowCleanWorkflowRunsCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowCleanWorkflowRunsCronJob.name)
  @SentryCronMonitor(
    WorkflowCleanWorkflowRunsCronJob.name,
    CLEAN_WORKFLOW_RUN_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowCleanWorkflowRunsCronJob cron');

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    let enqueuedCount = 0;

    for (
      let workspaceIndex = 0;
      workspaceIndex < activeWorkspaces.length;
      workspaceIndex += WORKSPACE_BATCH_SIZE
    ) {
      const batch = activeWorkspaces.slice(
        workspaceIndex,
        workspaceIndex + WORKSPACE_BATCH_SIZE,
      );

      const results = await Promise.allSettled(
        batch.map((workspace) => this.checkAndEnqueue(workspace.id)),
      );

      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled' && result.value) {
          enqueuedCount++;
        }

        if (result.status === 'rejected') {
          this.exceptionHandlerService.captureExceptions([result.reason], {
            workspace: { id: batch[index].id },
          });
        }
      }
    }

    this.logger.log(
      `Completed WorkflowCleanWorkflowRunsCronJob cron, enqueued ${enqueuedCount} jobs`,
    );
  }

  private async checkAndEnqueue(workspaceId: string): Promise<boolean> {
    const hasRunsToClean = await this.hasRunsToClean(workspaceId);

    if (hasRunsToClean) {
      await this.messageQueueService.add<WorkflowCleanWorkflowRunsJobData>(
        WorkflowCleanWorkflowRunsJob.name,
        { workspaceId },
      );

      return true;
    }

    return false;
  }

  private async hasRunsToClean(workspaceId: string): Promise<boolean> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const hasOldRuns = await workflowRunRepository.exists({
          where: getRunsToCleanFindOptions(),
        });

        if (hasOldRuns) {
          return true;
        }

        const totalCompletedRunsCount = await workflowRunRepository.count({
          where: {
            status: In([WorkflowRunStatus.COMPLETED, WorkflowRunStatus.FAILED]),
          },
        });

        return totalCompletedRunsCount > NUMBER_OF_WORKFLOW_RUNS_TO_KEEP;
      },
      authContext,
      { lite: true },
    );
  }
}
