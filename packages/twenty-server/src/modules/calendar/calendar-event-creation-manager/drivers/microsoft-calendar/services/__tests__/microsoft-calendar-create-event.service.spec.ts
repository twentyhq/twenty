import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MicrosoftCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/microsoft-calendar/services/microsoft-calendar-create-event.service';
import { CalendarEventCreationException } from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';

const connectedAccount = {
  id: 'account-1',
  provider: ConnectedAccountProvider.MICROSOFT,
};

const baseInput: CalendarEventToCreate = {
  title: 'Sync',
  startsAt: '2026-07-01T14:00:00Z',
  endsAt: '2026-07-01T15:00:00Z',
  isFullDay: false,
  timeZone: 'UTC',
  attendees: [],
  sendInvitations: false,
  addConferencing: false,
};

describe('MicrosoftCalendarCreateEventService', () => {
  let service: MicrosoftCalendarCreateEventService;
  const post = jest.fn();
  const header = jest.fn();
  const request = { header, post };
  header.mockReturnValue(request);
  const api = jest.fn().mockReturnValue(request);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftCalendarCreateEventService,
        {
          provide: MicrosoftOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({ api }) },
        },
      ],
    }).compile();

    service = module.get(MicrosoftCalendarCreateEventService);

    post.mockResolvedValue({
      id: 'microsoft-event-1',
      iCalUId: 'microsoft-event-1@outlook.com',
      subject: 'Sync',
      start: { dateTime: '2026-07-01T14:00:00.0000000', timeZone: 'UTC' },
      end: { dateTime: '2026-07-01T15:00:00.0000000', timeZone: 'UTC' },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('posts the mapped event to the calendar events endpoint', async () => {
    const result = await service.createCalendarEvent(
      baseInput,
      connectedAccount,
    );

    expect(api).toHaveBeenCalledWith('/me/calendar/events');
    expect(header).toHaveBeenCalledWith('Prefer', 'outlook.timezone="UTC"');
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Sync', isAllDay: false }),
    );
    expect(result.id).toBe('microsoft-event-1');
    expect(result.iCalUid).toBe('microsoft-event-1@outlook.com');
  });

  it('wraps provider errors in a CalendarEventCreationException', async () => {
    post.mockRejectedValue(new Error('boom'));

    await expect(
      service.createCalendarEvent(baseInput, connectedAccount),
    ).rejects.toThrow(CalendarEventCreationException);
  });
});
