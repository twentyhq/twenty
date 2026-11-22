import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { RevokeRoleWideAccessToAgentChatObjectsCommand } from 'src/engine/permissions/agent-chat-access/commands/revoke-role-wide-access-to-agent-chat-objects.command';
import { AgentChatIndividualRoleRecordsPermissionsService } from 'src/engine/permissions/agent-chat-access/services/agent-chat-individual-role-records-permissions.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatChannelEntity,
      AgentChatChannelRoleEntity,
    ]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    ApplicationModule,
  ],
  providers: [
    AgentChatIndividualRoleRecordsPermissionsService,
    RevokeRoleWideAccessToAgentChatObjectsCommand,
  ],
  exports: [AgentChatIndividualRoleRecordsPermissionsService],
})
export class AgentChatAccessModule {}
