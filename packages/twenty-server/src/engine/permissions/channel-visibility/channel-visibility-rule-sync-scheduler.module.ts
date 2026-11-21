import { Module } from '@nestjs/common';

import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ChannelVisibilityRuleSyncSchedulerService],
  exports: [ChannelVisibilityRuleSyncSchedulerService],
})
export class ChannelVisibilityRuleSyncSchedulerModule {}
