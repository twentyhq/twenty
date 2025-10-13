import { Module } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { MicrosoftCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-get-events.service';
import { MicrosoftCalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-import-events.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

@Module({
  imports: [TwentyConfigModule, OAuth2ClientManagerModule],
  providers: [
    MicrosoftCalendarGetEventsService,
    MicrosoftClientProvider,
    MicrosoftCalendarImportEventsService,
  ],
  exports: [
    MicrosoftCalendarGetEventsService,
    MicrosoftCalendarImportEventsService,
  ],
})
export class MicrosoftCalendarDriverModule {}
