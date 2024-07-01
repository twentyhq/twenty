import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { CalendarCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participants-manager/jobs/calendar-create-company-and-contact-after-sync.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participants-manager/jobs/messaging-create-company-and-contact-after-sync.job';
import { MessageParticipantListener } from 'src/modules/messaging/message-participants-manager/listeners/message-participant.listener';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    AnalyticsModule,
    MessagingGmailDriverModule,
    AutoCompaniesAndContactsCreationModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TwentyORMModule.forFeature([CalendarChannelWorkspaceEntity]),
  ],
  providers: [
    MessagingCreateCompanyAndContactAfterSyncJob,
    CalendarCreateCompanyAndContactAfterSyncJob,
    MessageParticipantListener,
  ],
})
export class MessaginParticipantsManagerModule {}
