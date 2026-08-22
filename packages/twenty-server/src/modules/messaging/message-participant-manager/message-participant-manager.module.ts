import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessageParticipantMatchParticipantJob } from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { MessageParticipantPersonListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-person.listener';
import { MessageParticipantWorkspaceMemberListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-workspace-member.listener';
import { MessageParticipantListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant.listener';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, ObjectMetadataEntity]),
    ContactCreationManagerModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    MessagingCommonModule,
    MatchParticipantModule,
    TimelineActivityModule,
  ],
  providers: [
    MessagingMessageParticipantService,
    MessageParticipantMatchParticipantJob,
    MessageParticipantListener,
    MessageParticipantPersonListener,
    MessageParticipantWorkspaceMemberListener,
  ],
  exports: [MessagingMessageParticipantService],
})
export class MessageParticipantManagerModule {}
