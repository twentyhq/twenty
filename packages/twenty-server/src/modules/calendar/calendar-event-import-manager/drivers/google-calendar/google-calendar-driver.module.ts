import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/providers/google-calendar.provider';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [EnvironmentModule, OAuth2ClientManagerModule],
  providers: [GoogleCalendarClientProvider, GoogleCalendarGetEventsService],
  exports: [GoogleCalendarGetEventsService],
})
export class GoogleCalendarDriverModule {}
