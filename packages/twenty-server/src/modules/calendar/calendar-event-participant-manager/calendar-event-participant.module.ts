import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdModule } from 'src/modules/calendar-messaging-participant/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.module';
import { CalendarEventParticipantListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant.listener';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TwentyORMModule.forFeature([CalendarEventParticipantWorkspaceEntity]),
    ObjectMetadataRepositoryModule.forFeature([PersonWorkspaceEntity]),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    AddPersonIdAndWorkspaceMemberIdModule,
  ],
  providers: [
    CalendarEventParticipantService,
    CalendarEventParticipantListener,
  ],
  exports: [CalendarEventParticipantService],
})
export class CalendarEventParticipantModule {}
