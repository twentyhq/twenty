import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { AiWorkspaceStatsResolver } from 'src/engine/metadata-modules/ai/ai-workspace-stats/resolvers/ai-workspace-stats.resolver';
import { AiWorkspaceStatsService } from 'src/engine/metadata-modules/ai/ai-workspace-stats/services/ai-workspace-stats.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    AgentHistoryModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    ToolProviderModule,
    UserRoleModule,
  ],
  providers: [AiWorkspaceStatsResolver, AiWorkspaceStatsService],
  exports: [AiWorkspaceStatsService],
})
export class AiWorkspaceStatsModule {}
