/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';
import { AccessGroupPropagationProgressService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-progress.service';

@Processor(MessageQueue.accessGroupQueue)
export class SyncAccessGroupsJob {
  constructor(
    private readonly accessGroupSyncService: AccessGroupSyncService,
    private readonly accessGroupPropagationProgressService: AccessGroupPropagationProgressService,
  ) {}

  @Process(SYNC_ACCESS_GROUPS_JOB_NAME)
  async handle(
    { workspaceId }: SyncAccessGroupsJobData,
    {
      attemptsMade,
      retryLimit,
    }: Pick<MessageQueueJobRetryContext, 'attemptsMade' | 'retryLimit'>,
  ): Promise<void> {
    try {
      await this.accessGroupSyncService.syncAccessGroups(workspaceId);
    } catch (error) {
      if (attemptsMade >= retryLimit) {
        await this.accessGroupPropagationProgressService.removePendingSync(
          workspaceId,
        );
      }

      throw error;
    }

    await this.accessGroupPropagationProgressService.removePendingSync(
      workspaceId,
    );
  }
}
