import { Module } from '@nestjs/common';

import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { CalendarEventFindManyPostQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-many.post-query.hook';
import { CalendarEventFindOnePostQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-find-one.post-query.hook';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';

@Module({
  imports: [ConnectedAccountDataAccessModule],
  providers: [
    ApplyCalendarEventsVisibilityRestrictionsService,
    CalendarEventFindOnePostQueryHook,
    CalendarEventFindManyPostQueryHook,
  ],
})
export class CalendarQueryHookModule {}
