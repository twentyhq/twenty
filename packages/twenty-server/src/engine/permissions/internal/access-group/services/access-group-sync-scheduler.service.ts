/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupSyncSchedulerService {
  constructor(
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async scheduleSync(workspaceId: string): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (!featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]) {
      return;
    }

    await this.messageQueueService.add<SyncAccessGroupsJobData>(
      SYNC_ACCESS_GROUPS_JOB_NAME,
      { workspaceId },
      {
        isWorkspaceJob: true,
        workspaceId,
        retryLimit: 3,
        deduplication: {
          id: `${SYNC_ACCESS_GROUPS_JOB_NAME}-${workspaceId}`,
          keepLastIfActive: true,
        },
      },
    );
  }
}
