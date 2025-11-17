import { Module } from '@nestjs/common';

import { MessageChannelUpdateOnePreQueryHook } from 'src/modules/messaging/message-channel-manager/query-hooks/message-channel-update-one.pre-query.hook';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [MessagingImportManagerModule],
  providers: [MessageChannelUpdateOnePreQueryHook],
  exports: [MessageChannelUpdateOnePreQueryHook],
})
export class MessageChannelQueryHookModule {}
