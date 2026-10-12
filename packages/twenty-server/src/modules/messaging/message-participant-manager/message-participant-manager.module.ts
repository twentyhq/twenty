import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';
import { MessageParticipantMatchParticipantJob } from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { MessageParticipantPersonListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-person.listener';
import { MessageParticipantWorkspaceMemberListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-workspace-member.listener';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    ContactCreationManagerModule,
    MatchParticipantModule,
  ],
  providers: [
    MessagingMessageParticipantService,
    MessageParticipantMatchParticipantJob,
    MessageParticipantPersonListener,
    MessageParticipantWorkspaceMemberListener,
  ],
  exports: [MessagingMessageParticipantService],
})
export class MessageParticipantManagerModule {}
