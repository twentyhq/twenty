import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findImportedCalendarEventTitles,
  findImportedMessageSubjects,
} from 'test/integration/utils/find-imported-records.util';
import { findRecordIdsByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-blocklist-cleanup@apple.dev';
const BLOCKED_HANDLE = `blocked-${randomUUID()}@acme.com`;

const gmailMessageFrom = (from: string): gmail_v1.Schema$Message => {
  const id = `gmail-msg-${randomUUID()}`;

  return {
    id,
    threadId: id,
    historyId: '987654321',
    internalDate: '1700000000000',
    labelIds: ['INBOX'],
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: from },
        { name: 'To', value: HANDLE },
        { name: 'Subject', value: `Subject ${id}` },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
      ],
      body: { data: Buffer.from(`body ${id}`).toString('base64'), size: 10 },
    },
  };
};

describe('Blocklist cleanup (integration)', () => {
  const blockedMessage = gmailMessageFrom(BLOCKED_HANDLE);
  const keptMessage = gmailMessageFrom(`kept-${randomUUID()}@acme.com`);

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

  it('deletes the blocked handle messages and calendar events, and keeps the others', async () => {
    const [workspaceMemberId] = await findRecordIdsByFilter(
      'workspaceMember',
      'workspaceMembers',
      {},
    );

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: 'id handle',
        data: { handle: BLOCKED_HANDLE, workspaceMemberId },
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
    ).toEqual([keptEventTitle]);
  }, 120000);
});
