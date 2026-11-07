import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerClientModule } from 'src/engine/metadata-modules/mcp-server/mcp-server-client.module';
import { McpServerConnectionResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server-connection.resolver';
import { McpServerOAuthModule } from 'src/engine/metadata-modules/mcp-server/oauth/mcp-server-oauth.module';
import { McpServerResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server.resolver';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    PermissionsModule,
    FeatureFlagModule,
    McpServerClientModule,
    McpServerOAuthModule,
    TypeOrmModule.forFeature([McpServerEntity]),
  ],
  providers: [McpServerService, McpServerResolver, McpServerConnectionResolver],
  exports: [McpServerService],
})
export class McpServerModule {}
