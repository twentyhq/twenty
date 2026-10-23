import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonRecordVisibilityModule } from 'src/engine/api/common/common-record-visibility/common-record-visibility.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';
import { CalendarEventTargetCreateManyPreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event-target/calendar-event-target-create-many.pre-query-hook';
import { CalendarEventTargetCreateOnePreQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event-target/calendar-event-target-create-one.pre-query-hook';

@Module({
  imports: [
    CommonRecordVisibilityModule,
    TypeOrmModule.forFeature([CalendarChannelEntity]),
  ],
  providers: [
    ApplyCalendarEventsVisibilityRestrictionsService,
    CalendarEventTargetCreateOnePreQueryHook,
    CalendarEventTargetCreateManyPreQueryHook,
  ],
})
export class CalendarQueryHookModule {}
