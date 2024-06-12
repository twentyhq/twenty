import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [EnvironmentModule, OAuth2ClientManagerModule],
  providers: [GoogleCalendarClientProvider],
  exports: [GoogleCalendarClientProvider],
})
export class CalendarProvidersModule {}
