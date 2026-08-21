import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-existing-person-matching@apple.dev';

const KNOWN_SENDER = `known-sender-${randomUUID()}@acme.com`;
const KNOWN_ATTENDEE = `known-attendee-${randomUUID()}@acme.com`;

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

describe('Participant matching when the person already exists (integration)', () => {
  const gmail = setupGoogleMock({
    handle: HANDLE,
    inbox: [gmailMessage({ from: KNOWN_SENDER, to: HANDLE })],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let senderPersonId: string;
  let attendeePersonId: string;

  beforeAll(async () => {
    senderPersonId = await createPerson(KNOWN_SENDER);
    attendeePersonId = await createPerson(KNOWN_ATTENDEE);

    await waitForAllJobsToFinish();

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      {
        isContactAutoCreationEnabled: false,
        contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.NONE,
      },
    );

    await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).update(
      { id: channel.calendarChannelId },
      { isContactAutoCreationEnabled: false },
    );

    await runMessageChannelSync(channel.channelId);

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: `Calendar event ${randomUUID()}`,
        attendees: [{ email: KNOWN_ATTENDEE }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    await waitForAllJobsToFinish();
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('links the imported message participant to the person that already owned the handle', async () => {
    expect(
      await findParticipantPersonIds(
        'messageParticipant',
        'messageParticipants',
        KNOWN_SENDER,
      ),
    ).toEqual([senderPersonId]);
  }, 60000);

  it('links the imported calendar event participant to the person that already owned the handle', async () => {
    expect(
      await findParticipantPersonIds(
        'calendarEventParticipant',
        'calendarEventParticipants',
        KNOWN_ATTENDEE,
      ),
    ).toEqual([attendeePersonId]);
  }, 60000);
});
