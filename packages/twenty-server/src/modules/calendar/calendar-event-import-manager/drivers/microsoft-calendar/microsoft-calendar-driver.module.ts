import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';

@Module({
  imports: [EnvironmentModule],
  providers: [
    MicrosoftCalendarGetEventsService,
    MicrosoftOAuth2ClientManagerService,
  ],
  exports: [MicrosoftCalendarGetEventsService],
})
export class MicrosoftCalendarDriverModule {}
