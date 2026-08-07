import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarEventVisibilityPostQueryHook } from 'src/modules/calendar/common/query-hooks/calendar-event/calendar-event-visibility.post-query.hook';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
  ],
  providers: [
    ApplyCalendarEventsVisibilityRestrictionsService,
    CalendarEventVisibilityPostQueryHook,
  ],
})
export class CalendarQueryHookModule {}
