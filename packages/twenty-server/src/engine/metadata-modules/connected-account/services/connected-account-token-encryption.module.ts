import { Module } from '@nestjs/common';

import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

// Standalone module so any caller (auth services, oauth-flow, refresh-tokens,
// oauth2-client-manager, ...) can pull in just the encryption service without
// dragging in the full ConnectedAccountMetadataModule (which has heavy ORM +
// permission dependencies it doesn't need at the call sites).
@Module({
  imports: [SecretEncryptionModule],
  providers: [ConnectedAccountTokenEncryptionService],
  exports: [ConnectedAccountTokenEncryptionService],
})
export class ConnectedAccountTokenEncryptionModule {}
