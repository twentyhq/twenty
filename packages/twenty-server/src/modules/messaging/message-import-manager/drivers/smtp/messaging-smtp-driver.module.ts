import { Module } from '@nestjs/common';

import { HostnameGuardModule } from 'src/engine/core-modules/hostname-guard/hostname-guard.module';

import { SmtpClientProvider } from './providers/smtp-client.provider';

@Module({
  imports: [HostnameGuardModule],
  providers: [SmtpClientProvider],
  exports: [SmtpClientProvider],
})
export class MessagingSmtpDriverModule {}
