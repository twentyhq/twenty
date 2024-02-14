import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { GmailClientProvider } from 'src/workspace/messaging/services/providers/gmail/gmail-client.provider';

@Module({
  imports: [EnvironmentModule],
  providers: [GmailClientProvider],
  exports: [GmailClientProvider],
})
export class MessagingProvidersModule {}
