import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarCreateCompanyAndContactAfterSyncJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-create-company-and-contact-after-sync.job';
import { CalendarEventParticipantMatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import { CalendarEventParticipantUnmatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-unmatch-participant.job';
import { CalendarEventParticipantPersonListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-person.listener';
import { CalendarEventParticipantWorkspaceMemberListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-workspace-member.listener';
import { CalendarEventParticipantListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant.listener';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceModule,
    TwentyORMModule.forFeature([CalendarEventParticipantWorkspaceEntity]),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    NestjsQueryTypeOrmModule.forFeature([Workspace], 'core'),
    ContactCreationManagerModule,
    MatchParticipantModule,
  ],
  providers: [
    CalendarEventParticipantService,
    CalendarCreateCompanyAndContactAfterSyncJob,
    CalendarEventParticipantMatchParticipantJob,
    CalendarEventParticipantUnmatchParticipantJob,
    CalendarEventParticipantListener,
    CalendarEventParticipantPersonListener,
    CalendarEventParticipantWorkspaceMemberListener,
  ],
  exports: [CalendarEventParticipantService],
})
export class CalendarEventParticipantManagerModule {}
