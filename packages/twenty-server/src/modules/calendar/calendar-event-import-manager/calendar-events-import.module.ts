import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';
import { GoogleCalendarDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/google-calendar-driver.module';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarEventParticipantModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant.module';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    TwentyORMModule.forFeature([
      CalendarEventWorkspaceEntity,
      CalendarChannelWorkspaceEntity,
      CalendarChannelEventAssociationWorkspaceEntity,
      CalendarEventParticipantWorkspaceEntity,
    ]),
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      BlocklistWorkspaceEntity,
      PersonWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
    CalendarEventParticipantModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
    CalendarEventCleanerModule,
    GoogleCalendarDriverModule,
  ],
  providers: [CalendarEventsImportService, CalendarEventsImportCronJob],
  exports: [CalendarEventsImportService],
})
export class CalendarEventsImportModule {}
