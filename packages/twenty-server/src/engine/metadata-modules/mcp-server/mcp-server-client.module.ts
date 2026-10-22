import { Module } from '@nestjs/common';

import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';

@Module({
  imports: [SecureHttpClientModule, SecretEncryptionModule],
  providers: [McpServerClientService],
  exports: [McpServerClientService],
})
export class McpServerClientModule {}
