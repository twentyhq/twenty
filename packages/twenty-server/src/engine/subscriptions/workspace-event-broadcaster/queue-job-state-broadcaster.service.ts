import { Injectable, Logger } from '@nestjs/common';

import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

type QueueJobStateBroadcastTarget = {
  workspaceId: string;
  jobId: string;
  jobName: string;
  userWorkspaceId: string;
};

@Injectable()
export class QueueJobStateBroadcaster {
  private readonly logger = new Logger(QueueJobStateBroadcaster.name);

  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async run<TResult>(
    target: QueueJobStateBroadcastTarget,
    work: () => Promise<TResult>,
  ): Promise<TResult> {
    await this.broadcast({ ...target, state: JobStateEnum.ACTIVE });

    try {
      const result = await work();

      await this.broadcast({ ...target, state: JobStateEnum.COMPLETED });

      return result;
    } catch (error) {
      await this.broadcast({
        ...target,
        state: JobStateEnum.FAILED,
        failedReason: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private async broadcast({
    workspaceId,
    jobId,
    jobName,
    userWorkspaceId,
    state,
    failedReason,
  }: QueueJobStateBroadcastTarget & {
    state: JobStateEnum;
    failedReason?: string;
  }): Promise<void> {
    try {
      await this.workspaceEventBroadcaster.broadcast({
        workspaceId,
        events: [
          {
            type: 'updated',
            entityName: 'queueJob',
            recordId: jobId,
            recipientUserWorkspaceIds: [userWorkspaceId],
            properties: {
              after: {
                id: jobId,
                name: jobName,
                state,
                failedReason: failedReason ?? null,
              },
            },
          },
        ],
      });
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast ${state} state for job ${jobId} (${jobName}) in workspace ${workspaceId}`,
        error,
      );
    }
  }
}
