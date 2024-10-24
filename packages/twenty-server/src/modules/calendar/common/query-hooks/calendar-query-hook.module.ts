import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CalendarEventFindManyPreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-many.pre-query.hook';
import { CalendarEventFindOnePreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-one.pre-query-hook';
import { CanAccessCalendarEventService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/can-access-calendar-event.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
  ],
  providers: [
    CanAccessCalendarEventService,
    CalendarEventFindOnePreQueryHook,
    CalendarEventFindManyPreQueryHook,
  ],
})
export class CalendarQueryHookModule {}
