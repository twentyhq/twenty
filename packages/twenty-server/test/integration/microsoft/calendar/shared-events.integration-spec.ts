import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';

import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { microsoftCalendarEvent } from 'test/integration/microsoft/mocks/microsoft-calendar-event.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'microsoft-calendar-shared-events@apple.dev';
const OTHER_HANDLE = 'microsoft-calendar-shared-events-other@apple.dev';

type AssociationNode = {
  calendarChannelId: string;
  calendarEventId: string;
};

describe('Microsoft calendar events shared across channels (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let otherChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const importAs = async (
    accountHandle: string,
    calendarChannelId: string,
    event: ReturnType<typeof microsoftCalendarEvent>,
  ): Promise<void> => {
    microsoft.actAsAccount(accountHandle);
    microsoft.serveCalendarEvents([event], {
      deltaToken: `shared-events-delta-token-${randomUUID()}`,
    });

    await resetCalendarChannelSyncState(calendarChannelId, '');
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  const findAssociations = (
    eventExternalIds: string[],
  ): Promise<AssociationNode[]> =>
    findRecordNodesByFilter<AssociationNode>(
      'calendarChannelEventAssociation',
      'calendarChannelEventAssociations',
      'calendarChannelId calendarEventId',
      { eventExternalId: { in: eventExternalIds } },
    );

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    microsoft.actAsAccount(OTHER_HANDLE);

    otherChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: OTHER_HANDLE,
    });

    microsoft.actAsAccount(HANDLE);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await otherChannel?.cleanup().catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  it('stores a meeting once even though each mailbox has its own event id', async () => {
    const iCalUId = `meeting-${randomUUID()}`;
    const eventId = `mailbox-event-${randomUUID()}`;
    const otherEventId = `mailbox-event-${randomUUID()}`;

    await importAs(
      HANDLE,
      channel.calendarChannelId,
      microsoftCalendarEvent({ id: eventId, iCalUId }),
    );
    await importAs(
      OTHER_HANDLE,
      otherChannel.calendarChannelId,
      microsoftCalendarEvent({ id: otherEventId, iCalUId }),
    );

    const associations = await findAssociations([eventId, otherEventId]);

    expect(
      associations.map(({ calendarChannelId }) => calendarChannelId).sort(),
    ).toEqual(
      [channel.calendarChannelId, otherChannel.calendarChannelId].sort(),
    );
    expect(
      new Set(associations.map(({ calendarEventId }) => calendarEventId)).size,
    ).toBe(1);
  }, 120000);
});
