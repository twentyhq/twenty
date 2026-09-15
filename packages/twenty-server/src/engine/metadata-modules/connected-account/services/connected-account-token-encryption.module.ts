import { Module } from '@nestjs/common';

import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

@Module({
  imports: [SecretEncryptionModule],
  providers: [ConnectedAccountTokenEncryptionService],
  exports: [ConnectedAccountTokenEncryptionService],
})
export class ConnectedAccountTokenEncryptionModule {}
