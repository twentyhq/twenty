import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessageParticipantMatchParticipantJob } from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participant-manager/jobs/messaging-create-company-and-contact-after-sync.job';
import { MessageParticipantPersonListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-person.listener';
import { MessageParticipantWorkspaceMemberListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-workspace-member.listener';
import { MessageParticipantListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant.listener';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [FeatureFlag, Workspace, ObjectMetadataEntity],
      'core',
    ),
    AuditModule,
    ContactCreationManagerModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    MessagingCommonModule,
    MatchParticipantModule,
  ],
  providers: [
    MessagingMessageParticipantService,
    MessageParticipantMatchParticipantJob,
    MessagingCreateCompanyAndContactAfterSyncJob,
    MessageParticipantListener,
    MessageParticipantPersonListener,
    MessageParticipantWorkspaceMemberListener,
  ],
  exports: [MessagingMessageParticipantService],
})
export class MessageParticipantManagerModule {}
