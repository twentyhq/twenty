import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME } from 'src/engine/permissions/channel-visibility/constants/sync-channel-visibility-rules-job-name.constant';
import { ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { type SyncChannelVisibilityRulesJobData } from 'src/engine/permissions/channel-visibility/types/sync-channel-visibility-rules-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class SyncChannelVisibilityRulesJob {
  constructor(
    private readonly channelVisibilityRuleSyncService: ChannelVisibilityRuleSyncService,
  ) {}

  @Process(SYNC_CHANNEL_VISIBILITY_RULES_JOB_NAME)
  async handle({
    workspaceId,
  }: SyncChannelVisibilityRulesJobData): Promise<void> {
    await this.channelVisibilityRuleSyncService.syncWorkspace(workspaceId);
  }
}
