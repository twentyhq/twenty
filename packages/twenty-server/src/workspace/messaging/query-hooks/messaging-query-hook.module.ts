import { Module } from '@nestjs/common';

import { MessageFindManyPreQueryHook } from 'src/workspace/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/workspace/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { ConnectedAccountModule } from 'src/workspace/messaging/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/workspace/messaging/repositories/message-channel/message-channel.module';
import { WorkspaceMemberModule } from 'src/workspace/messaging/repositories/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessageChannelMessageAssociationModule,
    MessageChannelModule,
    ConnectedAccountModule,
    WorkspaceMemberModule,
  ],
  providers: [
    {
      provide: MessageFindOnePreQueryHook.name,
      useClass: MessageFindOnePreQueryHook,
    },
    {
      provide: MessageFindManyPreQueryHook.name,
      useClass: MessageFindManyPreQueryHook,
    },
  ],
})
export class MessagingQueryHookModule {}
