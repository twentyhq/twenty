import { Module } from '@nestjs/common';

import { GoogleCalendarSyncCronCommand } from 'src/modules/calendar/crons/commands/google-calendar-sync.cron.command';

@Module({
  providers: [GoogleCalendarSyncCronCommand],
})
export class CalendarCronCommandsModule {}
