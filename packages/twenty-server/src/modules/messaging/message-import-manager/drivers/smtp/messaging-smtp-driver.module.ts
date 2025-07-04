import { Module } from '@nestjs/common';

import { SmtpClientProvider } from './providers/smtp-client.provider';

@Module({
  providers: [SmtpClientProvider],
  exports: [SmtpClientProvider],
})
export class MessagingSmtpDriverModule {}
