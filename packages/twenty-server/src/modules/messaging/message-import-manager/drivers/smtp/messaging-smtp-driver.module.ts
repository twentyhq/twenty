import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

import { SmtpClientProvider } from './providers/smtp-client.provider';

@Module({
  imports: [
    SecureHttpClientModule,
    ConnectedAccountTokenEncryptionModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
  ],
  providers: [SmtpClientProvider],
  exports: [SmtpClientProvider],
})
export class MessagingSmtpDriverModule {}
