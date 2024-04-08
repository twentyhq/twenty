import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { GoogleCalendarFullSyncService } from 'src/modules/calendar/services/google-calendar-full-sync.service';
import { CalendarProvidersModule } from 'src/modules/calendar/services/providers/calendar-providers.module';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Module({
  imports: [
    CalendarProvidersModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      CalendarEventObjectMetadata,
      CalendarChannelObjectMetadata,
      CalendarChannelEventAssociationObjectMetadata,
      CalendarEventParticipantObjectMetadata,
      BlocklistObjectMetadata,
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
    CalendarEventParticipantModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [GoogleCalendarFullSyncService],
  exports: [GoogleCalendarFullSyncService],
})
export class GoogleCalendarFullSyncModule {}
