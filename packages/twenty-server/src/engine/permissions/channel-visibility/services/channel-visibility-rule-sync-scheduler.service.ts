import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME } from 'src/engine/permissions/channel-visibility/constants/sync-channel-visibility-rules-job-name.constant';
import { type SyncChannelVisibilityRulesJobData } from 'src/engine/permissions/channel-visibility/types/sync-channel-visibility-rules-job-data.type';

@Injectable()
export class ChannelVisibilityRuleSyncSchedulerService {
  constructor(
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async scheduleSync(workspaceId: string): Promise<void> {
    await this.messageQueueService.add<SyncChannelVisibilityRulesJobData>(
      SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME,
      { workspaceId },
      { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
    );
  }
}
