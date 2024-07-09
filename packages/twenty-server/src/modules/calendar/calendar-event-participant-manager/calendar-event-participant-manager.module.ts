import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { CalendarCreateCompanyAndContactAfterSyncJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-create-company-and-contact-after-sync.job';
import { CalendarEventParticipantMatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import { CalendarEventParticipantUnmatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-unmatch-participant.job';
import { CalendarEventParticipantPersonListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-person.listener';
import { CalendarEventParticipantWorkspaceMemberListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-workspace-member.listener';
import { CalendarEventParticipantListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant.listener';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
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
    AutoCompaniesAndContactsCreationModule,
    CalendarCommonModule,
  ],
  providers: [
    CalendarEventParticipantService,
    CalendarCreateCompanyAndContactAfterSyncJob,
    CalendarEventParticipantMatchParticipantJob,
    CalendarEventParticipantUnmatchParticipantJob,
    CalendarEventParticipantListener,
    CalendarEventParticipantPersonListener,
    CalendarEventParticipantWorkspaceMemberListener,
    AddPersonIdAndWorkspaceMemberIdService,
  ],
  exports: [CalendarEventParticipantService],
})
export class CalendarEventParticipantManagerModule {}
