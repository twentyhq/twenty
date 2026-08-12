import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import {
  type GoogleApiFailure,
  setupGoogleMock,
} from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryCalendarChannel,
  queryConnectedAccount,
} from 'test/integration/utils/query-messaging.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'calendar-import-error-mapping@apple.dev';

// See the messaging suite: 401 and 403 are deliberately temporary so a
// transient auth blip cannot revoke a working account.
const INSUFFICIENT_PERMISSIONS_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 400 invalid_grant response',
    {
      status: 400,
      reason: 'invalid_grant',
      message: 'Token has been expired or revoked.',
    },
  ],
];

const TEMPORARY_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 401 unauthorized response',
    { status: 401, reason: 'authError', message: 'Invalid Credentials' },
  ],
  [
    'a 403 response that is not a rate limit',
    {
      status: 403,
      reason: 'insufficientPermissions',
      message: 'Request had insufficient authentication scopes.',
    },
  ],
  [
    'a 500 response with an unmapped reason',
    { status: 500, reason: 'somethingElse', message: 'Internal error' },
  ],
  [
    'a response with an unmapped status',
    { status: 418, reason: 'teapot', message: 'I am a teapot' },
  ],
  [
    'a 403 rateLimitExceeded response',
    {
      status: 403,
      reason: 'rateLimitExceeded',
      message: 'Rate Limit Exceeded',
    },
  ],
  [
    'a 403 userRateLimitExceeded response',
    {
      status: 403,
      reason: 'userRateLimitExceeded',
      message: 'User Rate Limit Exceeded',
    },
  ],
  [
    'a 400 failedPrecondition response',
    {
      status: 400,
      reason: 'failedPrecondition',
      message: 'Precondition check failed.',
    },
  ],
  [
    'a 500 backendError response',
    { status: 500, reason: 'backendError', message: 'Backend Error' },
  ],
  [
    'a 500 internal_failure response',
    { status: 500, reason: 'internal_failure', message: 'Internal failure' },
  ],
];

const UNKNOWN_FAILURES: [string, GoogleApiFailure][] = [
  [
    'a 400 response with an unmapped reason',
    { status: 400, reason: 'invalidArgument', message: 'Invalid query' },
  ],
];

describe('Google Calendar import error mapping (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  beforeEach(async () => {
    await resetCalendarChannelSyncState(channel.calendarChannelId);

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update({ id: channel.connectedAccountId }, { authFailedAt: null });
  });

  it.each(INSUFFICIENT_PERMISSIONS_FAILURES)(
    'fails the calendar channel as insufficient-permissions on %s',
    async (_label, failure) => {
      google.failCalendarEventList(failure);

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
      google.failCalendarEventList(failure);

      await runCalendarChannelListFetch(channel.calendarChannelId);

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.throttleFailureCount).toBe(1);
      expect(channelState.syncStage).toBe(
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      );
      expect(channelState.syncStatus).not.toBe(
        CalendarChannelSyncStatus.FAILED_UNKNOWN,
      );
      expect(channelState.syncStatus).not.toBe(
        CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );
    },
    60000,
  );

  it.each(UNKNOWN_FAILURES)(
    'fails the calendar channel as unknown on %s',
    async (_label, failure) => {
      google.failCalendarEventList(failure);

      await runCalendarChannelListFetch(channel.calendarChannelId);

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.syncStatus).toBe(
        CalendarChannelSyncStatus.FAILED_UNKNOWN,
      );
      expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
    },
    60000,
  );

  it('leaves the calendar channel untouched on a 404 during list fetch', async () => {
    google.failCalendarEventList({
      status: 404,
      reason: 'notFound',
      message: 'Not Found',
    });

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStatus).not.toBe(
      CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.throttleFailureCount).toBe(0);

    const storedChannel = await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: channel.calendarChannelId });

    expect(storedChannel.syncCursor).toBe('reset-cursor');
  }, 60000);
});
