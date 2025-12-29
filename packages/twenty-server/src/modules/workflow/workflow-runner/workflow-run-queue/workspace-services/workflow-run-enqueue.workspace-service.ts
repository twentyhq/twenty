import { Injectable, Logger } from '@nestjs/common';

import { Not } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Injectable()
export class WorkflowRunEnqueueWorkspaceService {
  private readonly logger = new Logger(WorkflowRunEnqueueWorkspaceService.name);
  constructor(
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
  ) {}

  async enqueueRuns({
    workspaceIds,
    isCacheMode,
  }: {
    workspaceIds: string[];
    isCacheMode: boolean;
  }) {
    for (const workspaceId of workspaceIds) {
      await this.enqueueRunsForWorkspace({ workspaceId, isCacheMode });
    }
  }

  async enqueueRunsForWorkspace({
    workspaceId,
    isCacheMode,
  }: {
    workspaceId: string;
    isCacheMode: boolean;
  }) {
    const lockAcquired =
      await this.workflowThrottlingWorkspaceService.acquireWorkflowEnqueueLock(
        workspaceId,
      );

    if (!lockAcquired) {
      return;
    }

    try {
      const authContext = buildSystemAuthContext(workspaceId);

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workflowRunRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkflowRunWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          const notStartedRunsCount = isCacheMode
            ? await this.workflowThrottlingWorkspaceService.getNotStartedRunsCountFromCache(
                workspaceId,
              )
            : await this.workflowThrottlingWorkspaceService.getNotStartedRunsCountFromDatabase(
                workspaceId,
              );

          if (notStartedRunsCount <= 0) {
            await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
              workspaceId,
            );

            return;
          }

          let remainingWorkflowRunToEnqueueCount =
            await this.workflowThrottlingWorkspaceService.getRemainingRunsToEnqueueCount(
              workspaceId,
            );

          const workflowRunIdsToEnqueue: string[] = [];

          if (remainingWorkflowRunToEnqueueCount > 0) {
            const additionalRunsToEnqueue = await workflowRunRepository.find({
              where: {
                status: WorkflowRunStatus.NOT_STARTED,
                ...(workflowRunIdsToEnqueue.length > 0
                  ? { id: Not(workflowRunIdsToEnqueue[0]) }
                  : {}),
              },
              select: {
                id: true,
              },
              order: {
                createdAt: 'ASC',
              },
              take: remainingWorkflowRunToEnqueueCount,
            });

            workflowRunIdsToEnqueue.push(
              ...additionalRunsToEnqueue.map(
                (workflowRun: WorkflowRunWorkspaceEntity) => workflowRun.id,
              ),
            );
          }

          if (workflowRunIdsToEnqueue.length <= 0) {
            if (!isCacheMode) {
              await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
                workspaceId,
              );
            }

            return;
          }

          await workflowRunRepository.update(workflowRunIdsToEnqueue, {
            enqueuedAt: new Date().toISOString(),
            status: WorkflowRunStatus.ENQUEUED,
          });

          await this.workflowThrottlingWorkspaceService.consumeRemainingRunsToEnqueueCount(
            workspaceId,
            workflowRunIdsToEnqueue.length,
          );

          for (const workflowRunId of workflowRunIdsToEnqueue) {
            await this.messageQueueService.add<RunWorkflowJobData>(
              RunWorkflowJob.name,
              {
                workflowRunId,
                workspaceId,
              },
            );
          }

          if (isCacheMode) {
            await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
              workspaceId,
              workflowRunIdsToEnqueue.length,
            );
          } else {
            await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
              workspaceId,
            );
          }
        },
      );
    } catch (error) {
      this.metricsService.incrementCounter({
        key: MetricsKeys.WorkflowRunFailedToEnqueue,
        eventId: workspaceId,
      });

      this.logger.error(
        `Failed to enqueue workflow runs for workspace: ${workspaceId}`,
        error,
      );
    } finally {
      await this.workflowThrottlingWorkspaceService.releaseWorkflowEnqueueLock(
        workspaceId,
      );
    }
  }
}
