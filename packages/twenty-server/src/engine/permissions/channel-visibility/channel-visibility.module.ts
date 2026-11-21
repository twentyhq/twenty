import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SyncChannelVisibilityRulesJob } from 'src/engine/permissions/channel-visibility/jobs/sync-channel-visibility-rules.job';
import { ChannelVisibilityRuleSyncListener } from 'src/engine/permissions/channel-visibility/listeners/channel-visibility-rule-sync.listener';
import { ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { ChannelVisibilityRuleSyncSchedulerModule } from 'src/engine/permissions/channel-visibility/channel-visibility-rule-sync-scheduler.module';
import { WorkspaceMemberIndividualRoleService } from 'src/engine/permissions/channel-visibility/services/workspace-member-individual-role.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ChannelVisibilityRuleSyncSchedulerModule,
    TypeOrmModule.forFeature([MessageChannelEntity, CalendarChannelEntity]),
    WorkspaceCacheModule,
    CacheLockModule,
    WorkspaceMigrationModule,
    ApplicationModule,
  ],
  providers: [
    WorkspaceMemberIndividualRoleService,
    ChannelVisibilityRuleSyncService,
    ChannelVisibilityRuleSyncListener,
    SyncChannelVisibilityRulesJob,
  ],
  exports: [
    WorkspaceMemberIndividualRoleService,
    ChannelVisibilityRuleSyncService,
  ],
})
export class ChannelVisibilityModule {}
