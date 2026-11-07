import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { McpServerOAuthClientEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server-oauth-client.entity';
import { McpServerOAuthClientService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-client.service';
import { McpServerOAuthTokenRefreshService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-token-refresh.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Kept free of the refresh tokens manager, which imports it for MCP accounts.
@Module({
  imports: [
    TypeOrmModule.forFeature([McpServerOAuthClientEntity]),
    ConnectedAccountTokenEncryptionModule,
    SecureHttpClientModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(McpServerOAuthClientEntity),
    McpServerOAuthClientService,
    McpServerOAuthTokenRefreshService,
  ],
  exports: [McpServerOAuthClientService, McpServerOAuthTokenRefreshService],
})
export class McpServerOAuthClientModule {}
