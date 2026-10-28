import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server.resolver';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    PermissionsModule,
    FeatureFlagModule,
    ConnectedAccountTokenEncryptionModule,
    RefreshTokensManagerModule,
    SecureHttpClientModule,
    TypeOrmModule.forFeature([McpServerEntity, ConnectedAccountEntity]),
  ],
  providers: [
    provideWorkspaceScopedRepository(McpServerEntity),
    McpServerService,
    McpServerClientService,
    McpServerToolSyncService,
    McpServerResolver,
  ],
  exports: [McpServerService],
})
export class McpServerModule {}
