import { Module } from '@nestjs/common';

import { MicrosoftCalendarEventListFetchErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-event-list-fetch-error-handler.service';
import { MicrosoftCalendarEventsImportErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-events-import-error-handler.service';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import { MicrosoftCalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-import-events.service';
import { MicrosoftCalendarNetworkErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-network-error-handler.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    MicrosoftCalendarGetEventsService,
    MicrosoftCalendarImportEventsService,
    MicrosoftCalendarNetworkErrorHandler,
    MicrosoftCalendarEventListFetchErrorHandler,
    MicrosoftCalendarEventsImportErrorHandler,
  ],
  exports: [
    MicrosoftCalendarGetEventsService,
    MicrosoftCalendarImportEventsService,
    MicrosoftCalendarEventListFetchErrorHandler,
    MicrosoftCalendarEventsImportErrorHandler,
  ],
})
export class MicrosoftCalendarDriverModule {}
