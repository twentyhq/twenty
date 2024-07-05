import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessageParticipantMatchParticipantJob } from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { MessageParticipantUnmatchParticipantJob } from 'src/modules/messaging/message-participant-manager/jobs/message-participant-unmatch-participant.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participant-manager/jobs/messaging-create-company-and-contact-after-sync.job';
import { MessageParticipantPersonListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-person.listener';
import { MessageParticipantWorkspaceMemberListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant-workspace-member.listener';
import { MessageParticipantListener } from 'src/modules/messaging/message-participant-manager/listeners/message-participant.listener';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    AnalyticsModule,
    AutoCompaniesAndContactsCreationModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TwentyORMModule.forFeature([CalendarChannelWorkspaceEntity]),
    MessagingCommonModule,
  ],
  providers: [
    MessagingMessageParticipantService,
    MessageParticipantMatchParticipantJob,
    MessageParticipantUnmatchParticipantJob,
    MessagingCreateCompanyAndContactAfterSyncJob,
    MessageParticipantListener,
    MessageParticipantPersonListener,
    MessageParticipantWorkspaceMemberListener,
    AddPersonIdAndWorkspaceMemberIdService,
  ],
  exports: [MessagingMessageParticipantService],
})
export class MessageParticipantManagerModule {}
