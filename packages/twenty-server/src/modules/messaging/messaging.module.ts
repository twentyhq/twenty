import { Module } from '@nestjs/common';

import { MessagingPersonListener } from 'src/modules/messaging/listeners/messaging-person.listener';
import { MessagingWorkspaceMemberListener } from 'src/modules/messaging/listeners/messaging-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
@Module({
  imports: [],
  providers: [
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessagingConnectedAccountListener,
  ],
  exports: [],
})
export class MessagingModule {}
