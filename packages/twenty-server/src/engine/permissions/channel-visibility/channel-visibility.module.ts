import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SyncChannelVisibilityRulesJob } from 'src/engine/permissions/channel-visibility/jobs/sync-channel-visibility-rules.job';
import { ChannelVisibilityRuleSyncListener } from 'src/engine/permissions/channel-visibility/listeners/channel-visibility-rule-sync.listener';
import { ChannelVisibilityRoleWideAccessRevokeService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-revoke.service';
import { ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { WorkspaceMemberIndividualRoleModule } from 'src/engine/permissions/workspace-member-individual-role/workspace-member-individual-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity, CalendarChannelEntity]),
    WorkspaceCacheModule,
    CacheLockModule,
    WorkspaceMemberIndividualRoleModule,
    WorkspaceMigrationModule,
    ApplicationModule,
  ],
  providers: [
    ChannelVisibilityRuleSyncSchedulerService,
    ChannelVisibilityRuleSyncService,
    ChannelVisibilityRuleSyncListener,
    SyncChannelVisibilityRulesJob,
    ChannelVisibilityRoleWideAccessRevokeService,
  ],
  exports: [
    ChannelVisibilityRoleWideAccessRevokeService,
    ChannelVisibilityRuleSyncService,
    ChannelVisibilityRuleSyncSchedulerService,
  ],
})
export class ChannelVisibilityModule {}
