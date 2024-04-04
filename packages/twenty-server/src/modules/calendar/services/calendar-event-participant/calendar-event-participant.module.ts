import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { AddPersonIdAndWorkspaceMemberIdModule } from 'src/modules/connected-account/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.module';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([PersonObjectMetadata]),
    AddPersonIdAndWorkspaceMemberIdModule,
  ],
  providers: [CalendarEventParticipantService],
  exports: [CalendarEventParticipantService],
})
export class CalendarEventParticipantModule {}
