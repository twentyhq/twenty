import { Injectable } from '@nestjs/common';

import { type Event } from '@microsoft/microsoft-graph-types';

import { MicrosoftCalendarEventsImportErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-events-import-error-handler.service';
import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class MicrosoftCalendarImportEventsService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
    private readonly microsoftCalendarEventsImportErrorHandler: MicrosoftCalendarEventsImportErrorHandler,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
    eventExternalIds: string[],
  ): Promise<FetchedCalendarEvent[]> {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const events: Event[] = [];

    for (const eventExternalId of eventExternalIds) {
      const event = await microsoftClient
        .api(`/me/calendar/events/${eventExternalId}`)
        .header('Prefer', 'outlook.body-content-type="text"')
        .get()
        .catch((error: unknown) =>
          this.microsoftCalendarEventsImportErrorHandler.handleError(error),
        );

      events.push(event);
    }

    return formatMicrosoftCalendarEvents(events);
  }
}
