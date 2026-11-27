import { Module } from '@nestjs/common';

import { CalendarEventTargetCreateManyPreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event-target/calendar-event-target-create-many.pre-query-hook';
import { CalendarEventTargetCreateOnePreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event-target/calendar-event-target-create-one.pre-query-hook';

@Module({
  providers: [
    CalendarEventTargetCreateOnePreQueryHook,
    CalendarEventTargetCreateManyPreQueryHook,
  ],
})
export class CalendarQueryHookModule {}
