import { Module } from '@nestjs/common';

import { MessageFindManyPreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { ConnectedAccountModule } from 'src/modules/connected-account/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/modules/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/modules/messaging/repositories/message-channel/message-channel.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/repositories/workspace-member/workspace-member.module';

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
