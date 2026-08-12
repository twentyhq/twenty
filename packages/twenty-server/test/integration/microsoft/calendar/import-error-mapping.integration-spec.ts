import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES } from 'src/modules/connected-account/constants/microsoft-permanent-account-error-codes.constant';

import {
  type MicrosoftGraphFailure,
  setupMicrosoftMock,
} from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryCalendarChannel,
  queryConnectedAccount,
} from 'test/integration/utils/query-messaging.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'microsoft-calendar-error-mapping@apple.dev';

const TEMPORARY_FAILURES: [string, MicrosoftGraphFailure][] = [
  [
    'a 429 throttled response',
    { status: 429, code: 'ApplicationThrottled', message: 'Too many requests' },
  ],
  [
    'a 500 response',
    { status: 500, code: 'InternalServerError', message: 'Internal error' },
  ],
  [
    'a 503 response',
    { status: 503, code: 'ServiceUnavailable', message: 'Service unavailable' },
  ],
];

describe('Microsoft calendar import error mapping (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  beforeEach(async () => {
    await resetCalendarChannelSyncState(channel.calendarChannelId, '');

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update({ id: channel.connectedAccountId }, { authFailedAt: null });
  });

  it.each(MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES)(
    'fails the calendar channel as insufficient-permissions on the permanent account error %s',
    async (code) => {
      microsoft.failCalendarDelta({
        status: 403,
        code,
        message: 'The mailbox is unavailable',
      });

      await runCalendarChannelListFetch(channel.calendarChannelId);

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.syncStatus).toBe(
        CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );
      expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);

      const account = await queryConnectedAccount(channel.connectedAccountId);

      expect(account.authFailedAt).not.toBeNull();
    },
    60000,
  );

  it.each(TEMPORARY_FAILURES)(
    'throttles the calendar channel without failing it on %s',
    async (_label, failure) => {
      microsoft.failCalendarDelta(failure);

      await runCalendarChannelListFetch(channel.calendarChannelId);

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.throttleFailureCount).toBe(1);
      expect(channelState.syncStage).toBe(
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      );
      expect(channelState.syncStatus).not.toBe(
        CalendarChannelSyncStatus.FAILED_UNKNOWN,
      );
    },
    60000,
  );

  it('fails the calendar channel as unknown on a 400 bad request', async () => {
    microsoft.failCalendarDelta({
      status: 400,
      code: 'BadRequest',
      message: 'Invalid delta token',
    });

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStatus).toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
  }, 60000);

  it('leaves the calendar channel untouched on a 404 during list fetch', async () => {
    microsoft.failCalendarDelta({
      status: 404,
      code: 'ResourceNotFound',
      message: 'Resource not found',
    });

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.throttleFailureCount).toBe(0);

    const storedChannel = await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: channel.calendarChannelId });

    expect(storedChannel.syncCursor).toBeFalsy();
  }, 60000);

  it('restarts the calendar channel from a clean cursor on a 410 expired delta token', async () => {
    microsoft.failCalendarDelta({
      status: 410,
      code: 'syncStateNotFound',
      message: 'The delta token is expired',
    });

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );
    expect(channelState.throttleFailureCount).toBe(0);

    const storedChannel = await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: channel.calendarChannelId });

    expect(storedChannel.syncCursor).toBeFalsy();
  }, 60000);
});
