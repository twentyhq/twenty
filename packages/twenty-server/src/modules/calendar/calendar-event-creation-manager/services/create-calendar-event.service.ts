import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GoogleCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/google-calendar/services/google-calendar-create-event.service';
import { MicrosoftCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/microsoft-calendar/services/microsoft-calendar-create-event.service';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { type ComposedCalendarEvent } from 'src/modules/calendar/calendar-event-creation-manager/types/composed-calendar-event.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

@Injectable()
export class CreateCalendarEventService {
  private readonly logger = new Logger(CreateCalendarEventService.name);

  constructor(
    private readonly googleCalendarCreateEventService: GoogleCalendarCreateEventService,
    private readonly microsoftCalendarCreateEventService: MicrosoftCalendarCreateEventService,
    private readonly calendarSaveEventsService: CalendarSaveEventsService,
  ) {}

  async createComposedCalendarEvent(
    data: ComposedCalendarEvent,
  ): Promise<FetchedCalendarEvent> {
    switch (data.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleCalendarCreateEventService.createCalendarEvent(
          data.input,
          data.connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftCalendarCreateEventService.createCalendarEvent(
          data.input,
          data.connectedAccount,
        );
      default:
        throw new CalendarEventCreationException(
          `Calendar event creation is not supported for provider ${data.connectedAccount.provider}`,
          CalendarEventCreationExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  // Persist the created event right away so it is immediately visible in Twenty.
  // The next provider sync reconciles it via its external id, so a persistence
  // failure here is non-fatal.
  async persistCalendarEvent(
    createdEvent: FetchedCalendarEvent,
    data: ComposedCalendarEvent,
    workspaceId: string,
  ): Promise<void> {
    try {
      await this.calendarSaveEventsService.saveCalendarEventsAndEnqueueContactCreationJob(
        [createdEvent],
        data.calendarChannel,
        data.connectedAccount,
        workspaceId,
      );
    } catch (persistenceError) {
      this.logger.warn(
        `Failed to persist created calendar event (sync will recover): ${persistenceError}`,
      );
    }
  }
}
