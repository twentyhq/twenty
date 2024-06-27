import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/providers/google-calendar.provider';

@Module({
  imports: [EnvironmentModule],
  providers: [GoogleCalendarClientProvider],
  exports: [GoogleCalendarClientProvider],
})
export class GoogleCalendarDriverModule {}
