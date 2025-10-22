import { Module } from '@nestjs/common';

import { MessageChannelUpdateOnePreQueryHook } from 'src/modules/messaging/message-channel-manager/query-hooks/message-channel-update-one.pre-query.hook';

@Module({
  providers: [MessageChannelUpdateOnePreQueryHook],
})
export class MessageChannelQueryHookModule {}
