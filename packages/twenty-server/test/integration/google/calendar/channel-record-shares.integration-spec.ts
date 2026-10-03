import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { findRecordShares } from 'test/integration/utils/find-record-shares.util';
import { updateCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const JANE_HANDLE = 'google-calendar-record-shares-jane@apple.dev';
const JONY_HANDLE = 'google-calendar-record-shares-jony@apple.dev';

const syncToken = () => `calendar-record-shares-sync-token-${randomUUID()}`;

const runCalendarSync = async (calendarChannelId: string): Promise<void> => {
  await runCalendarChannelListFetch(calendarChannelId);
  await runCalendarChannelEventsImport(calendarChannelId);
};

const ownerShare = (workspaceMemberId: string, channelId: string) => ({
  principalId: workspaceMemberId,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: channelId,
});

const everyoneShare = (channelId: string) => ({
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.RULE,
  sourceId: channelId,
});

describe('Calendar event grants derived from channels (integration)', () => {
  const eventExternalId = `google-calendar-event-${randomUUID()}`;
  const eventTitle = `Calendar record shares ${randomUUID()}`;

  const google = setupGoogleMock({ handle: JANE_HANDLE });

  let janeChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let jonyChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let calendarEventId: string;
  let jonyCalendarEventId: string;

  const findCalendarEventIds = async () =>
    (
      await findRecordNodesByFilter<{ id: string }>(
        'calendarEvent',
        'calendarEvents',
        'id',
        { title: { eq: eventTitle } },
      )
    ).map(({ id }) => id);

  const serveEvent = (status: 'confirmed' | 'cancelled') =>
    google.serveCalendarEvents(
      [
        googleCalendarEvent({
          id: eventExternalId,
          summary: eventTitle,
          status,
        }),
      ],
      { nextSyncToken: syncToken() },
    );

  beforeAll(async () => {
    janeChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JANE_HANDLE,
    });

    serveEvent('confirmed');

    await runCalendarSync(janeChannel.calendarChannelId);

    const calendarEventIds = await findCalendarEventIds();

    expect(calendarEventIds).toHaveLength(1);

    [calendarEventId] = calendarEventIds;
  }, 120000);

  afterAll(async () => {
    await jonyChannel?.cleanup().catch(() => undefined);
    await janeChannel?.cleanup().catch(() => undefined);
  });

  it('makes the syncing member an owner and shares with everyone when the channel shares everything', async () => {
    expect(await findRecordShares(calendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        janeChannel.calendarChannelId,
      ),
      everyoneShare(janeChannel.calendarChannelId),
    ]);
  }, 60000);

  it('withdraws the everyone share when the channel stops sharing and restores it after', async () => {
    await updateCalendarChannel(janeChannel.calendarChannelId, {
      visibility: CalendarChannelVisibility.METADATA,
    });

    expect(await findRecordShares(calendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        janeChannel.calendarChannelId,
      ),
    ]);

    await updateCalendarChannel(janeChannel.calendarChannelId, {
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    });

    expect(await findRecordShares(calendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        janeChannel.calendarChannelId,
      ),
      everyoneShare(janeChannel.calendarChannelId),
    ]);
  }, 60000);

  // Each channel imports its own copy of an event, so two members syncing the
  // same meeting each own a separate record.
  it('makes each member the owner of the copy their channel synced', async () => {
    google.actAsAccount(JONY_HANDLE);

    jonyChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JONY_HANDLE,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    serveEvent('confirmed');

    await runCalendarSync(jonyChannel.calendarChannelId);

    const jonyCalendarEventIds = (await findCalendarEventIds()).filter(
      (id) => id !== calendarEventId,
    );

    expect(jonyCalendarEventIds).toHaveLength(1);
    jonyCalendarEventId = jonyCalendarEventIds[0];

    expect(await findRecordShares(jonyCalendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        jonyChannel.calendarChannelId,
      ),
      everyoneShare(jonyChannel.calendarChannelId),
    ]);
    expect(await findRecordShares(calendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        janeChannel.calendarChannelId,
      ),
      everyoneShare(janeChannel.calendarChannelId),
    ]);
  }, 120000);

  it('drops the grants of an event its channel cancelled and keeps the other copy', async () => {
    serveEvent('cancelled');

    await runCalendarSync(jonyChannel.calendarChannelId);

    expect(await findRecordShares(jonyCalendarEventId)).toEqual([]);
    expect(await findRecordShares(calendarEventId)).toEqual([
      ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        janeChannel.calendarChannelId,
      ),
      everyoneShare(janeChannel.calendarChannelId),
    ]);
  }, 60000);

  it('drops the grants of a removed channel', async () => {
    await janeChannel.cleanup();

    expect(await findRecordShares(calendarEventId)).toEqual([]);
  }, 60000);
});
