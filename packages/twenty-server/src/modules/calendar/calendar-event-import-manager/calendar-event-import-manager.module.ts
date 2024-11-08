import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventListFetchCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-event-list-fetch.cron.command';
import { CalendarEventsImportCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-import.cron.command';
import { CalendarOngoingStaleCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-ongoing-stale.cron.command';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { GoogleCalendarDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/google-calendar-driver.module';
import { MicrosoftCalendarDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/microsoft-calendar-driver.module';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarEventsImportJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { CalendarOngoingStaleJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';
import { CalendarEventImportErrorHandlerService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { RefreshAccessTokenManagerModule } from 'src/modules/connected-account/refresh-access-token-manager/refresh-access-token-manager.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      BlocklistWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
    CalendarEventParticipantManagerModule,
    TypeOrmModule.forFeature([FeatureFlagEntity, Workspace], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    WorkspaceDataSourceModule,
    CalendarEventCleanerModule,
    GoogleCalendarDriverModule,
    MicrosoftCalendarDriverModule,
    BillingModule,
    RefreshAccessTokenManagerModule,
    CalendarEventParticipantManagerModule,
    ConnectedAccountModule,
    CalendarCommonModule,
  ],
  providers: [
    CalendarChannelSyncStatusService,
    CalendarEventsImportService,
    CalendarFetchEventsService,
    CalendarEventImportErrorHandlerService,
    CalendarGetCalendarEventsService,
    CalendarSaveEventsService,
    CalendarEventListFetchCronJob,
    CalendarEventListFetchCronCommand,
    CalendarEventListFetchJob,
    CalendarEventsImportCronJob,
    CalendarEventsImportCronCommand,
    CalendarEventsImportJob,
    CalendarOngoingStaleCronJob,
    CalendarOngoingStaleCronCommand,
    CalendarOngoingStaleJob,
  ],
  exports: [CalendarEventsImportService, CalendarFetchEventsService],
})
export class CalendarEventImportManagerModule {}
