import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerClientModule } from 'src/engine/metadata-modules/mcp-server/mcp-server-client.module';
import { McpServerOAuthClientModule } from 'src/engine/metadata-modules/mcp-server/oauth/mcp-server-oauth-client.module';
import { McpServerConnectionService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-connection.service';
import { McpServerOAuthFlowService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-flow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserEntity]),
    ConnectionProviderModule,
    ConnectedAccountTokenEncryptionModule,
    McpServerClientModule,
    McpServerOAuthClientModule,
    SecureHttpClientModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [McpServerOAuthFlowService, McpServerConnectionService],
  exports: [McpServerOAuthFlowService, McpServerConnectionService],
})
export class McpServerOAuthModule {}
