import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server.resolver';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  providers: [McpServerService, McpServerResolver],
  exports: [McpServerService],
})
export class McpServerModule {}
