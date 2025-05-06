import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CalendarEventFindManyPostQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-many.post-query.hook';
import { CalendarEventFindManyPreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-many.pre-query.hook';
import { CalendarEventFindOnePostQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-one.post-query.hook';
import { CalendarEventFindOnePreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-one.pre-query-hook';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';
import { CanAccessCalendarEventsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/can-access-calendar-events.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
  ],
  providers: [
    CanAccessCalendarEventsService,
    ApplyCalendarEventsVisibilityRestrictionsService,
    CalendarEventFindOnePreQueryHook,
    CalendarEventFindManyPreQueryHook,
    CalendarEventFindOnePostQueryHook,
    CalendarEventFindManyPostQueryHook,
  ],
})
export class CalendarQueryHookModule {}
