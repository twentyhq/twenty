import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GoogleCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/google-calendar-attendees.service';
import { MicrosoftCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/microsoft-calendar-attendees.service';
import { type CalendarAttendee } from 'src/modules/onboarding-invite-suggestions/types/calendar-attendee.type';

@Injectable()
export class CalendarAttendeesService {
  constructor(
    private readonly googleCalendarAttendeesService: GoogleCalendarAttendeesService,
    private readonly microsoftCalendarAttendeesService: MicrosoftCalendarAttendeesService,
  ) {}

  async getRecentAttendees(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
  ): Promise<CalendarAttendee[]> {
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
