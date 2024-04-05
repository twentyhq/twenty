import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParticipantPersonListener } from 'src/modules/connected-account/listeners/participant-person.listener';
import { ParticipantWorkspaceMemberListener } from 'src/modules/connected-account/listeners/participant-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlagEntity], 'core')],
  providers: [
    ParticipantPersonListener,
    ParticipantWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessagingConnectedAccountListener,
  ],
  exports: [],
})
export class MessagingModule {}
