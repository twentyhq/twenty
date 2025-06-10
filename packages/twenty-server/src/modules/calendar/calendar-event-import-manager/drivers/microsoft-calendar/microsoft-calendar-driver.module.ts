import { Module } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import { MicrosoftCalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-import-events.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';

@Module({
  imports: [TwentyConfigModule],
  providers: [
    MicrosoftCalendarGetEventsService,
    MicrosoftCalendarImportEventsService,
    MicrosoftOAuth2ClientManagerService,
  ],
  exports: [
    MicrosoftCalendarGetEventsService,
    MicrosoftCalendarImportEventsService,
  ],
})
export class MicrosoftCalendarDriverModule {}
