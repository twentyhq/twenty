import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { AgentChatAccessModule } from 'src/engine/permissions/agent-chat-access/agent-chat-access.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RevokeRoleWideAccessToChannelObjectsCommand } from 'src/engine/permissions/channel-visibility/commands/revoke-role-wide-access-to-channel-objects.command';
import { SyncChannelVisibilityRulesJob } from 'src/engine/permissions/channel-visibility/jobs/sync-channel-visibility-rules.job';
import { AgentChatIndividualRoleSyncListener } from 'src/engine/permissions/channel-visibility/listeners/agent-chat-individual-role-sync.listener';
import { ChannelVisibilityRuleSyncListener } from 'src/engine/permissions/channel-visibility/listeners/channel-visibility-rule-sync.listener';
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
    AgentChatAccessModule,
    WorkspaceMemberIndividualRoleModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    ApplicationModule,
  ],
  providers: [
    ChannelVisibilityRuleSyncSchedulerService,
    ChannelVisibilityRuleSyncService,
    ChannelVisibilityRuleSyncListener,
    AgentChatIndividualRoleSyncListener,
    SyncChannelVisibilityRulesJob,
    RevokeRoleWideAccessToChannelObjectsCommand,
  ],
  exports: [
    ChannelVisibilityRuleSyncService,
    ChannelVisibilityRuleSyncSchedulerService,
  ],
})
export class ChannelVisibilityModule {}
