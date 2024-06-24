import { Module } from '@nestjs/common';

import { GoogleCalendarSyncCommand } from 'src/modules/calendar/commands/google-calendar-sync.command';
import { WorkspaceGoogleCalendarSyncModule } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.module';

@Module({
  imports: [WorkspaceGoogleCalendarSyncModule],
  providers: [GoogleCalendarSyncCommand],
})
export class CalendarCommandsModule {}
