import { Injectable } from '@nestjs/common';

import { type Event } from '@microsoft/microsoft-graph-types';
import { isNonEmptyString } from '@sniptt/guards';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MicrosoftCalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-import-events.service';
import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { toMicrosoftEventInput } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-microsoft-event-input.util';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';

@Injectable()
export class MicrosoftCalendarCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
    private readonly microsoftCalendarImportEventsService: MicrosoftCalendarImportEventsService,
  ) {}

  async createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<ConnectedAccountEntity, 'id' | 'provider'>,
  ): Promise<FetchedCalendarEvent> {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    let createdEvent: Event;

    try {
      createdEvent = await microsoftClient
        .api('/me/calendar/events')
        .post(toMicrosoftEventInput(input));
    } catch (error) {
      throw new CalendarEventCreationException(
        `Failed to create Microsoft calendar event: ${error instanceof Error ? error.message : 'unknown error'}`,
        CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
      );
    }

    if (!isNonEmptyString(createdEvent.id)) {
      return formatMicrosoftCalendarEvents([createdEvent])[0];
    }

    const [createdEventAsListedBySync] =
      await this.microsoftCalendarImportEventsService
        .getCalendarEvents(connectedAccount, [createdEvent.id])
        .catch(() => []);

    return (
      createdEventAsListedBySync ??
      formatMicrosoftCalendarEvents([createdEvent])[0]
    );
  }
}
