import { Module } from '@nestjs/common';

import { MessagingMessageCleanerModule } from 'src/modules/messaging/message-cleaner/messaging-message-cleaner.module';

@Module({
  imports: [MessagingMessageCleanerModule],
  providers: [],
  exports: [],
})
export class MessagingModule {}
