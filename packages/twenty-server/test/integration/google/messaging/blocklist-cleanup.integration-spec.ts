import { randomUUID } from 'node:crypto';

import { BlocklistScope, ConnectedAccountProvider } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
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
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-blocklist-cleanup@apple.dev';
const BLOCKED_HANDLE = `blocked-${randomUUID()}@acme.com`;
const WORKSPACE_BLOCKED_HANDLE = `workspace-blocked-${randomUUID()}@acme.com`;

describe('Blocklist cleanup (integration)', () => {
  const blockedMessage = gmailMessage({ from: BLOCKED_HANDLE, to: HANDLE });
  const workspaceBlockedMessage = gmailMessage({
    from: WORKSPACE_BLOCKED_HANDLE,
    to: HANDLE,
  });
  const keptMessage = gmailMessage({
    from: `kept-${randomUUID()}@acme.com`,
    to: HANDLE,
  });

  const blockedSubject = getGmailMessageSubject(blockedMessage);
  const workspaceBlockedSubject = getGmailMessageSubject(
    workspaceBlockedMessage,
  );
  const keptSubject = getGmailMessageSubject(keptMessage);

  const blockedEventTitle = `Blocked event ${randomUUID()}`;
  const keptEventTitle = `Kept event ${randomUUID()}`;

  const inbox = [blockedMessage, workspaceBlockedMessage, keptMessage];

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  const blocklistIds: string[] = [];

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
    for (const blocklistId of blocklistIds) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'blocklist',
          gqlFields: 'id',
          recordId: blocklistId,
        }),
      ).catch(() => undefined);
    }

    await channel?.cleanup().catch(() => undefined);
  });

  it('imports every message and the calendar event before anything is blocked', async () => {
    expect(
      await findImportedMessageSubjects([
        blockedSubject,
        workspaceBlockedSubject,
        keptSubject,
      ]),
    ).toEqual([blockedSubject, workspaceBlockedSubject, keptSubject].sort());

    expect(
      await findImportedCalendarEventTitles([
        blockedEventTitle,
        keptEventTitle,
      ]),
    ).toEqual([blockedEventTitle, keptEventTitle].sort());
  }, 60000);

  it('deletes the blocked handle messages and keeps the calendar events imported before the block', async () => {
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

    blocklistIds.push(response.body.data.createBlocklist.id);

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

  it('deletes the messages of a handle blocked for the whole workspace', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: 'id handle scope workspaceMemberId',
        data: {
          handle: WORKSPACE_BLOCKED_HANDLE,
          scope: BlocklistScope.WORKSPACE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createBlocklist.workspaceMemberId).toBeNull();

    blocklistIds.push(response.body.data.createBlocklist.id);

    await waitForAllJobsToFinish();

    expect(
      await findImportedMessageSubjects([workspaceBlockedSubject, keptSubject]),
    ).toEqual([keptSubject]);
  }, 120000);

  it('never imports new messages or calendar events involving a workspace-blocked handle', async () => {
    const resyncBlockedMessage = gmailMessage({
      from: WORKSPACE_BLOCKED_HANDLE,
      to: HANDLE,
    });
    const resyncKeptMessage = gmailMessage({
      from: `resync-kept-${randomUUID()}@acme.com`,
      to: HANDLE,
    });
    const resyncBlockedSubject = getGmailMessageSubject(resyncBlockedMessage);
    const resyncKeptSubject = getGmailMessageSubject(resyncKeptMessage);

    inbox.push(resyncBlockedMessage, resyncKeptMessage);
    gmail.serveMessageList([resyncBlockedMessage, resyncKeptMessage]);

    await resetMessageChannelSyncState(channel.channelId, '');
    await runMessageChannelSync(channel.channelId);
    await waitForAllJobsToFinish();

    expect(
      await findImportedMessageSubjects([
        resyncBlockedSubject,
        resyncKeptSubject,
      ]),
    ).toEqual([resyncKeptSubject]);

    const blockedAttendeeEventTitle = `Workspace blocked event ${randomUUID()}`;
    const importedEventTitle = `Workspace kept event ${randomUUID()}`;

    gmail.serveCalendarEvents(
      [
        googleCalendarEvent({
          summary: blockedAttendeeEventTitle,
          attendees: [{ email: WORKSPACE_BLOCKED_HANDLE }],
        }),
        googleCalendarEvent({
          summary: importedEventTitle,
          attendees: [
            { email: `workspace-kept-attendee-${randomUUID()}@acme.com` },
          ],
        }),
      ],
      { nextSyncToken: 'mock-calendar-sync-token-workspace-blocklist' },
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
    await waitForAllJobsToFinish();

    expect(
      await findImportedCalendarEventTitles([
        blockedAttendeeEventTitle,
        importedEventTitle,
      ]),
    ).toEqual([importedEventTitle]);
  }, 180000);
});
