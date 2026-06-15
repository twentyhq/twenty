import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GoogleCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/google-calendar-attendees.service';
import { MicrosoftCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/microsoft-calendar-attendees.service';
import { type RawCalendarAttendee } from 'src/modules/onboarding-invite-suggestions/types/raw-calendar-attendee.type';

@Injectable()
export class CalendarAttendeesService {
  constructor(
    private readonly googleCalendarAttendeesService: GoogleCalendarAttendeesService,
    private readonly microsoftCalendarAttendeesService: MicrosoftCalendarAttendeesService,
  ) {}

  // Dispatches to the right provider driver. Providers without a calendar
  // integration (e.g. IMAP/CalDav) yield no suggestions.
  async getRecentAttendees(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
  ): Promise<RawCalendarAttendee[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleCalendarAttendeesService.getRecentAttendees(
          connectedAccount.id,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftCalendarAttendeesService.getRecentAttendees(
          connectedAccount.id,
        );
      default:
        return [];
    }
  }
}
