import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';
import { type ComposeCalendarEventParams } from 'src/modules/calendar/calendar-event-creation-manager/types/compose-calendar-event-params.type';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const WORKSPACE_ID = 'workspace-1';
const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

const googleAccount = {
  id: ACCOUNT_ID,
  provider: ConnectedAccountProvider.GOOGLE,
  scopes: [GOOGLE_SCOPE],
  archivedAt: null,
} as ConnectedAccountEntity;

const calendarChannel = { id: 'channel-1' } as CalendarChannelEntity;

const validParams: ComposeCalendarEventParams = {
  title: 'Sync',
  startsAt: '2026-07-01T14:00:00Z',
  endsAt: '2026-07-01T15:00:00Z',
  connectedAccountId: ACCOUNT_ID,
};

describe('CalendarEventComposerService', () => {
  let service: CalendarEventComposerService;
  const connectedAccountFindOne = jest.fn();
  const calendarChannelFindOne = jest.fn();
  const calendarChannelFind = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarEventComposerService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne: connectedAccountFindOne },
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: {
            findOne: calendarChannelFindOne,
            find: calendarChannelFind,
          },
        },
      ],
    }).compile();

    service = module.get(CalendarEventComposerService);

    connectedAccountFindOne.mockResolvedValue(googleAccount);
    calendarChannelFindOne.mockResolvedValue(calendarChannel);
  });

  afterEach(() => jest.clearAllMocks());

  it('rejects an event without a title', async () => {
    const result = await service.composeCalendarEvent(
      { ...validParams, title: '' },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects when endsAt is not after startsAt', async () => {
    const result = await service.composeCalendarEvent(
      { ...validParams, endsAt: validParams.startsAt },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only title', async () => {
    const result = await service.composeCalendarEvent(
      { ...validParams, title: '   ' },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects a timed event without a UTC offset', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        startsAt: '2026-07-01T14:00:00',
        endsAt: '2026-07-01T15:00:00',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects a date-only value for a timed event', async () => {
    const result = await service.composeCalendarEvent(
      { ...validParams, startsAt: '2026-07-01', endsAt: '2026-07-02' },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects an all-day event whose start and end fall on the same day', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        isFullDay: true,
        startsAt: '2026-07-01T00:00:00Z',
        endsAt: '2026-07-01T12:00:00Z',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('accepts a valid multi-day all-day event', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        isFullDay: true,
        startsAt: '2026-07-01',
        endsAt: '2026-07-03',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input.isFullDay).toBe(true);
    }
  });

  it('rejects an invalid time zone', async () => {
    const result = await service.composeCalendarEvent(
      { ...validParams, timeZone: 'Not/AZone' },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('rejects invalid attendee emails when sending invitations', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        sendInvitations: true,
        attendees: 'not-an-email',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('strips attendees entirely when invitations are not requested', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        sendInvitations: false,
        attendees: 'guest@example.com',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input.attendees).toEqual([]);
    }
  });

  it('parses comma-separated attendees when sending invitations', async () => {
    const result = await service.composeCalendarEvent(
      {
        ...validParams,
        sendInvitations: true,
        attendees: 'a@example.com, b@example.com',
      },
      WORKSPACE_ID,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input.attendees).toEqual([
        { email: 'a@example.com' },
        { email: 'b@example.com' },
      ]);
    }
  });

  it('fails when the connected account does not exist', async () => {
    connectedAccountFindOne.mockResolvedValue(null);

    const result = await service.composeCalendarEvent(
      validParams,
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('fails when the account is missing the calendar write scope', async () => {
    connectedAccountFindOne.mockResolvedValue({
      ...googleAccount,
      scopes: ['email'],
    });

    const result = await service.composeCalendarEvent(
      validParams,
      WORKSPACE_ID,
    );

    expect(result.success).toBe(false);
  });

  it('resolves the account and channel for a valid request', async () => {
    const result = await service.composeCalendarEvent(
      validParams,
      WORKSPACE_ID,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.connectedAccount.id).toBe(ACCOUNT_ID);
      expect(result.data.calendarChannel.id).toBe('channel-1');
      expect(result.data.input.timeZone).toBe('UTC');
    }
  });

  it('falls back to the first calendar-capable account when none is specified', async () => {
    calendarChannelFind.mockResolvedValue([
      { ...calendarChannel, connectedAccount: googleAccount },
    ]);

    const result = await service.composeCalendarEvent(
      { ...validParams, connectedAccountId: undefined },
      WORKSPACE_ID,
    );

    expect(calendarChannelFind).toHaveBeenCalled();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.connectedAccount.id).toBe(ACCOUNT_ID);
    }
  });
});
