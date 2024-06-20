import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistItemDeleteCalendarEventsJob } from 'src/modules/calendar/jobs/blocklist-item-delete-calendar-events.job';
import { BlocklistReimportCalendarEventsJob } from 'src/modules/calendar/jobs/blocklist-reimport-calendar-events.job';
import { CalendarCreateCompanyAndContactAfterSyncJob } from 'src/modules/calendar/jobs/calendar-create-company-and-contact-after-sync.job';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/jobs/delete-connected-account-associated-calendar-data.job';
import { GoogleCalendarSyncJob } from 'src/modules/calendar/jobs/google-calendar-sync.job';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { GoogleCalendarSyncModule } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.module';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.module';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      CalendarChannelWorkspaceEntity,
      CalendarChannelEventAssociationWorkspaceEntity,
      CalendarEventParticipantWorkspaceEntity,
      ConnectedAccountWorkspaceEntity,
      BlocklistWorkspaceEntity,
    ]),
    CalendarEventCleanerModule,
    AutoCompaniesAndContactsCreationModule,
    GoogleCalendarSyncModule,
    GoogleAPIRefreshAccessTokenModule,
    GoogleCalendarSyncModule,
  ],
  providers: [
    BlocklistItemDeleteCalendarEventsJob,
    BlocklistReimportCalendarEventsJob,
    GoogleCalendarSyncJob,
    CalendarCreateCompanyAndContactAfterSyncJob,
    DeleteConnectedAccountAssociatedCalendarDataJob,
  ],
})
export class CalendarJobModule {}
