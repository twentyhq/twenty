import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/calendar-attendees.service';
import { GoogleCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/google-calendar-attendees.service';
import { MicrosoftCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/microsoft-calendar-attendees.service';

describe('CalendarAttendeesService', () => {
  let service: CalendarAttendeesService;
  let googleCalendarAttendeesService: { getRecentAttendees: jest.Mock };
  let microsoftCalendarAttendeesService: { getRecentAttendees: jest.Mock };

  const buildConnectedAccount = (
    provider: ConnectedAccountProvider,
  ): Pick<ConnectedAccountEntity, 'provider' | 'id'> => ({
    id: 'connected-account-id',
    provider,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarAttendeesService,
        {
          provide: GoogleCalendarAttendeesService,
          useValue: { getRecentAttendees: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: MicrosoftCalendarAttendeesService,
          useValue: { getRecentAttendees: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(CalendarAttendeesService);
    googleCalendarAttendeesService = module.get(GoogleCalendarAttendeesService);
    microsoftCalendarAttendeesService = module.get(
      MicrosoftCalendarAttendeesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('routes Google accounts to the Google fetcher', async () => {
    await service.getRecentAttendees(
      buildConnectedAccount(ConnectedAccountProvider.GOOGLE),
    );

    expect(
      googleCalendarAttendeesService.getRecentAttendees,
    ).toHaveBeenCalledWith('connected-account-id');
    expect(
      microsoftCalendarAttendeesService.getRecentAttendees,
    ).not.toHaveBeenCalled();
  });

  it('routes Microsoft accounts to the Microsoft fetcher', async () => {
    await service.getRecentAttendees(
      buildConnectedAccount(ConnectedAccountProvider.MICROSOFT),
    );

    expect(
      microsoftCalendarAttendeesService.getRecentAttendees,
    ).toHaveBeenCalledWith('connected-account-id');
    expect(
      googleCalendarAttendeesService.getRecentAttendees,
    ).not.toHaveBeenCalled();
  });

  it('returns no attendees for providers without a calendar integration', async () => {
    const result = await service.getRecentAttendees(
      buildConnectedAccount(ConnectedAccountProvider.IMAP_SMTP_CALDAV),
    );

    expect(result).toEqual([]);
    expect(
      googleCalendarAttendeesService.getRecentAttendees,
    ).not.toHaveBeenCalled();
    expect(
      microsoftCalendarAttendeesService.getRecentAttendees,
    ).not.toHaveBeenCalled();
  });
});
