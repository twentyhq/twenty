import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  CalendarChannelDeletionCleanupJob,
  type CalendarChannelDeletionCleanupJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/calendar-channel-deletion-cleanup.job';
import {
  MessagingMessageChannelDeletionCleanupJob,
  type MessagingMessageChannelDeletionCleanupJobData,
} from 'src/modules/messaging/message-cleaner/jobs/messaging-message-channel-deletion-cleanup.job';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import {
  findImportedCalendarEventTitles,
  findImportedMessageSubjects,
} from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-channel-deletion-cleanup@apple.dev';

describe('Channel deletion cleanup (integration)', () => {
  const inbox = [gmailMessage()];
  const expectedSubject = getGmailMessageSubject(inbox[0]);
  const eventTitle = `Calendar event ${randomUUID()}`;

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let workspaceId: string;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    workspaceId = (
      await getCoreRepository<MessageChannelEntity>(
        MessageChannelEntity,
      ).findOneByOrFail({ id: channel.channelId })
    ).workspaceId;

    await runMessageChannelSync(channel.channelId);

    gmail.serveCalendarEvents([googleCalendarEvent({ summary: eventTitle })]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('drops the imported messages when the message channel is cleaned up', async () => {
    expect(await findImportedMessageSubjects([expectedSubject])).toEqual([
      expectedSubject,
    ]);

    await enqueueJobAndDrain<MessagingMessageChannelDeletionCleanupJobData>(
      MessageQueue.messagingQueue,
      MessagingMessageChannelDeletionCleanupJob.name,
      { workspaceId, messageChannelId: channel.channelId },
    );

    expect(await findImportedMessageSubjects([expectedSubject])).toEqual([]);
  }, 120000);

  it('drops the imported calendar events when the calendar channel is cleaned up', async () => {
    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);

    await enqueueJobAndDrain<CalendarChannelDeletionCleanupJobData>(
      MessageQueue.calendarQueue,
      CalendarChannelDeletionCleanupJob.name,
      { workspaceId, calendarChannelId: channel.calendarChannelId },
    );

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([]);
  }, 120000);
});
