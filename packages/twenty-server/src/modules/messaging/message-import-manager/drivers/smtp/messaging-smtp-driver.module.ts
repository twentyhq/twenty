import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

import { SmtpClientProvider } from './providers/smtp-client.provider';

@Module({
  imports: [SecureHttpClientModule],
  providers: [SmtpClientProvider],
  exports: [SmtpClientProvider],
})
export class MessagingSmtpDriverModule {}
