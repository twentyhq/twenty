import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { GoogleCalendarClientProvider } from 'src/workspace/calendar/services/providers/google-calendar/google-calendar.provider';

@Module({
  imports: [EnvironmentModule],
  providers: [GoogleCalendarClientProvider],
  exports: [GoogleCalendarClientProvider],
})
export class CalendarProvidersModule {}
