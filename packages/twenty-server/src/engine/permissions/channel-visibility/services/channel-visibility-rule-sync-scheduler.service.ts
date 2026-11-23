import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME } from 'src/engine/permissions/channel-visibility/constants/sync-channel-visibility-rules-job-name.constant';
import { type SyncChannelVisibilityRulesJobData } from 'src/engine/permissions/channel-visibility/types/sync-channel-visibility-rules-job-data.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ChannelVisibilityRuleSyncSchedulerService {
  constructor(
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async scheduleSyncIfEnabled(workspaceId: string): Promise<void> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (isChannelVisibilityRlsEnabled(featureFlagsMap)) {
      await this.scheduleSync(workspaceId);
    }
  }

  async scheduleSync(workspaceId: string): Promise<void> {
    await this.messageQueueService.add<SyncChannelVisibilityRulesJobData>(
      SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME,
      { workspaceId },
      { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
    );
  }
}
