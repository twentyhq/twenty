import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarBlocklistListener } from 'src/modules/calendar/blocklist-manager/listeners/calendar-blocklist.listener';
import { CalendarEventParticipantListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant.listener';
import { CalendarChannelListener } from 'src/modules/connected-account/auto-companies-and-contacts-creation/listeners/calendar-calendar-channel.listener';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    CalendarChannelListener,
    CalendarBlocklistListener,
    CalendarEventParticipantListener,
  ],
  exports: [],
})
export class CalendarModule {}
