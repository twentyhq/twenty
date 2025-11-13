import { Module } from '@nestjs/common';

import { MessagingClearCursorsService } from 'src/modules/messaging/message-import-manager/services/messaging-clear-cursors.service';

@Module({
  providers: [MessagingClearCursorsService],
  exports: [MessagingClearCursorsService],
})
export class MessagingClearCursorsModule {}
