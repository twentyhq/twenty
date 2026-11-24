/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupSyncSchedulerService {
  constructor(
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async isEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return isAccessGroupsEnabled({ featureFlagsMap });
  }

  async scheduleSyncIfEnabled({
    workspaceId,
    isRelatedRecordPathChanged = false,
  }: SyncAccessGroupsJobData): Promise<void> {
    if (!(await this.isEnabled(workspaceId))) {
      return;
    }

    await this.messageQueueService.add<SyncAccessGroupsJobData>(
      SYNC_ACCESS_GROUPS_JOB_NAME,
      { workspaceId, isRelatedRecordPathChanged },
      { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
    );
  }
}
