import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ParticipantPersonListener } from 'src/modules/calendar-messaging-participant/listeners/participant-person.listener';
import { ParticipantWorkspaceMemberListener } from 'src/modules/calendar-messaging-participant/listeners/participant-workspace-member.listener';
import { MessagingBlocklistListener } from 'src/modules/messaging/listeners/messaging-blocklist.listener';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlagEntity], 'core')],
  providers: [
    ParticipantPersonListener,
    ParticipantWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessagingConnectedAccountListener,
    MessagingBlocklistListener,
  ],
  exports: [],
})
export class MessagingModule {}
