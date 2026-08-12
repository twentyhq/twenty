import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-participant-matching@apple.dev';

const UNMATCHED_HANDLE = `unmatched-${randomUUID()}@acme.com`;
const UNMATCHED_ATTENDEE = `attendee-${randomUUID()}@acme.com`;

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

const findParticipantPersonIds = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  handle: string,
) => {
  const participants = await findRecordNodesByFilter<{
    personId: string | null;
  }>(objectMetadataSingularName, objectMetadataPluralName, 'personId', {
    handle: { eq: handle },
  });

  return participants.map((participant) => participant.personId);
};

describe('Participant matching on person creation (integration)', () => {
  const gmail = setupGoogleMock({
    handle: HANDLE,
    inbox: [gmailMessageFrom(UNMATCHED_HANDLE)],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    // Auto-creation off, so the participants stay unmatched until the person
    // is created explicitly and the matching job runs.
    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      {
        isContactAutoCreationEnabled: false,
        contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.NONE,
      },
    );

    await runMessageChannelSync(channel.channelId);

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: `Calendar event ${randomUUID()}`,
        attendees: [{ email: UNMATCHED_ATTENDEE }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('leaves the imported participants unmatched while no person owns the handle', async () => {
    expect(
      await findParticipantPersonIds(
        'messageParticipant',
        'messageParticipants',
        UNMATCHED_HANDLE,
      ),
    ).toEqual([null]);

    expect(
      await findParticipantPersonIds(
        'calendarEventParticipant',
        'calendarEventParticipants',
        UNMATCHED_ATTENDEE,
      ),
    ).toEqual([null]);
  }, 60000);

  it('matches both message and calendar participants when the person is created', async () => {
    const createPerson = async (primaryEmail: string) => {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: { emails: { primaryEmail } },
        }),
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.createPerson.id as string;
    };

    const messagePersonId = await createPerson(UNMATCHED_HANDLE);
    const attendeePersonId = await createPerson(UNMATCHED_ATTENDEE);

    await waitForAllJobsToFinish();

    expect(
      await findParticipantPersonIds(
        'messageParticipant',
        'messageParticipants',
        UNMATCHED_HANDLE,
      ),
    ).toEqual([messagePersonId]);

    expect(
      await findParticipantPersonIds(
        'calendarEventParticipant',
        'calendarEventParticipants',
        UNMATCHED_ATTENDEE,
      ),
    ).toEqual([attendeePersonId]);
  }, 120000);
});
