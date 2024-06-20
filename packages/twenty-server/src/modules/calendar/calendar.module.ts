import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarBlocklistListener } from 'src/modules/calendar/listeners/calendar-blocklist.listener';
import { CalendarChannelListener } from 'src/modules/calendar/listeners/calendar-channel.listener';
import { CalendarEventParticipantListener } from 'src/modules/calendar/listeners/calendar-event-participant.listener';
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
