import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarTriggerEventListFetchCommand } from 'src/modules/calendar/calendar-event-import-manager/commands/calendar-trigger-event-list-fetch.command';
import { CalendarEventListFetchCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-event-list-fetch.cron.command';
import { CalendarEventsImportCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-import.cron.command';
import { CalendarOngoingStaleCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-ongoing-stale.cron.command';
import { CalendarRelaunchFailedCalendarChannelsCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-relaunch-failed-calendar-channels.cron.command';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { CalendarRelaunchFailedCalendarChannelsCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-relaunch-failed-calendar-channels.cron.job';
import { CalDavDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/caldav-driver.module';
import { GoogleCalendarDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/google-calendar-driver.module';
import { MicrosoftCalendarDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/microsoft-calendar-driver.module';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarEventsImportJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { CalendarOngoingStaleJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';
import { CalendarRelaunchFailedCalendarChannelJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-relaunch-failed-calendar-channel.job';
import { CalendarAccountAuthenticationService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-account-authentication.service';
import { CalendarEventImportErrorHandlerService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    CalendarEventParticipantManagerModule,
    TypeOrmModule.forFeature([
      FeatureFlagEntity,
      WorkspaceEntity,
      DataSourceEntity,
    ]),
    WorkspaceDataSourceModule,
    CalendarEventCleanerModule,
    GoogleCalendarDriverModule,
    CalDavDriverModule,
    MicrosoftCalendarDriverModule,
    BillingModule,
    RefreshTokensManagerModule,
    ConnectedAccountModule,
    CalendarCommonModule,
    MetricsModule,
  ],
  providers: [
    CalendarAccountAuthenticationService,
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
    CalendarTriggerEventListFetchCommand,
    CalendarOngoingStaleJob,
    CalendarRelaunchFailedCalendarChannelsCronJob,
    CalendarRelaunchFailedCalendarChannelsCronCommand,
    CalendarRelaunchFailedCalendarChannelJob,
  ],
  exports: [
    CalendarEventsImportService,
    CalendarFetchEventsService,
    CalendarEventListFetchCronCommand,
    CalendarEventsImportCronCommand,
    CalendarOngoingStaleCronCommand,
    CalendarRelaunchFailedCalendarChannelsCronCommand,
  ],
})
export class CalendarEventImportManagerModule {}
