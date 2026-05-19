import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

import { SmtpClientProvider } from './providers/smtp-client.provider';

@Module({
  imports: [SecureHttpClientModule, ConnectedAccountTokenEncryptionModule],
  providers: [SmtpClientProvider],
  exports: [SmtpClientProvider],
})
export class MessagingSmtpDriverModule {}
