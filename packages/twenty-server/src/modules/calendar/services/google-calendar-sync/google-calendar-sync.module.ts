import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.service';
import { CalendarProvidersModule } from 'src/modules/calendar/services/providers/calendar-providers.module';
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
    CalendarProvidersModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      CalendarEventWorkspaceEntity,
      CalendarChannelWorkspaceEntity,
      CalendarChannelEventAssociationWorkspaceEntity,
      CalendarEventParticipantWorkspaceEntity,
      BlocklistWorkspaceEntity,
      PersonWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
    CalendarEventParticipantModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
    CalendarEventCleanerModule,
  ],
  providers: [GoogleCalendarSyncService],
  exports: [GoogleCalendarSyncService],
})
export class GoogleCalendarSyncModule {}
