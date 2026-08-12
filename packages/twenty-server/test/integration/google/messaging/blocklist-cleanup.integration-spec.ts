import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findImportedCalendarEventTitles,
  findImportedMessageSubjects,
} from 'test/integration/utils/find-imported-records.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-blocklist-cleanup@apple.dev';
const BLOCKED_HANDLE = `blocked-${randomUUID()}@acme.com`;

describe('Blocklist cleanup (integration)', () => {
  const blockedMessage = gmailMessage({ from: BLOCKED_HANDLE, to: HANDLE });
  const keptMessage = gmailMessage({
    from: `kept-${randomUUID()}@acme.com`,
    to: HANDLE,
  });

  const blockedSubject = getGmailMessageSubject(blockedMessage);
  const keptSubject = getGmailMessageSubject(keptMessage);

  const blockedEventTitle = `Blocked event ${randomUUID()}`;
  const keptEventTitle = `Kept event ${randomUUID()}`;

  const gmail = setupGoogleMock({
    handle: HANDLE,
    inbox: [blockedMessage, keptMessage],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: blockedEventTitle,
        attendees: [{ email: BLOCKED_HANDLE }],
      }),
      googleCalendarEvent({
        summary: keptEventTitle,
        attendees: [{ email: `kept-attendee-${randomUUID()}@acme.com` }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports both the message and the calendar event before anything is blocked', async () => {
    expect(
      await findImportedMessageSubjects([blockedSubject, keptSubject]),
    ).toEqual([blockedSubject, keptSubject].sort());

    expect(
      await findImportedCalendarEventTitles([
        blockedEventTitle,
        keptEventTitle,
      ]),
    ).toEqual([blockedEventTitle, keptEventTitle].sort());
  }, 60000);

  // Blocking a handle deletes their messages but deliberately leaves calendar
  // events alone: an event the blocked handle merely attended is still the
  // workspace's own meeting, so it is not swept up with them.
  it('deletes the blocked handle messages and keeps every calendar event', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: 'id handle',
        data: {
          handle: BLOCKED_HANDLE,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    expect(
      await findImportedMessageSubjects([blockedSubject, keptSubject]),
    ).toEqual([keptSubject]);

    expect(
      await findImportedCalendarEventTitles([
        blockedEventTitle,
        keptEventTitle,
      ]),
    ).toEqual([blockedEventTitle, keptEventTitle].sort());
  }, 120000);
});
