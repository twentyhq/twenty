import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatMcpServerModule } from 'src/engine/metadata-modules/flat-mcp-server/flat-mcp-server.module';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server.resolver';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { McpServerClientModule } from 'src/engine/metadata-modules/mcp-server/mcp-server-client.module';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([McpServerEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceCacheModule,
    ApplicationModule,
    PermissionsModule,
    FeatureFlagModule,
    SecretEncryptionModule,
    McpServerClientModule,
    FlatMcpServerModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(McpServerEntity),
    McpServerToolSyncService,
    McpServerService,
    McpServerResolver,
  ],
  exports: [McpServerService, McpServerToolSyncService],
})
export class McpServerModule {}
