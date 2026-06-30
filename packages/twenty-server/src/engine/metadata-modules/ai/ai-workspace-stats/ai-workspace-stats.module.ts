import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AiWorkspaceStatsResolver } from 'src/engine/metadata-modules/ai/ai-workspace-stats/resolvers/ai-workspace-stats.resolver';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentChatThreadEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    ToolProviderModule,
    UserRoleModule,
  ],
  providers: [
    AiWorkspaceStatsResolver,
    AiWorkspaceStatsService,
    provideWorkspaceScopedRepository(AgentChatThreadEntity),
  ],
  exports: [AiWorkspaceStatsService],
})
export class AiWorkspaceStatsModule {}
