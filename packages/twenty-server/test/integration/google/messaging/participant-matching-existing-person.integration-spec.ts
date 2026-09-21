import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

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

type ImportedParticipantLink<
  TLinkedRecordIdField extends 'messageId' | 'calendarEventId',
> = {
  personId: string | null;
} & Record<TLinkedRecordIdField, string>;

const findParticipantLinks = async <
  TLinkedRecordIdField extends 'messageId' | 'calendarEventId',
>(
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  handle: string,
  linkedRecordIdField: TLinkedRecordIdField,
): Promise<ImportedParticipantLink<TLinkedRecordIdField>[]> =>
  findRecordNodesByFilter<ImportedParticipantLink<TLinkedRecordIdField>>(
    objectMetadataSingularName,
    objectMetadataPluralName,
    `personId ${linkedRecordIdField}`,
    { handle: { eq: handle } },
  );

const findLinkedTimelineActivities = async ({
  personId,
  linkedRecordId,
}: {
  personId: string;
  linkedRecordId: string;
}) =>
  findRecordNodesByFilter<{
    linkedRecordId: string;
    timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot;
  }>(
    'timelineActivity',
    'timelineActivities',
    'linkedRecordId timelineActivityTypeSnapshot',
    {
      targetPersonId: { eq: personId },
      linkedRecordId: { eq: linkedRecordId },
    },
  );

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

  it('creates a typed timeline activity when importing an email for an existing person', async () => {
    const participants = await findParticipantLinks(
      'messageParticipant',
      'messageParticipants',
      KNOWN_SENDER,
      'messageId',
    );
    const [participant] = participants;

    expect(participants).toHaveLength(1);
    expect(participant.personId).toBe(senderPersonId);

    const timelineActivities = await findLinkedTimelineActivities({
      personId: senderPersonId,
      linkedRecordId: participant.messageId,
    });

    expect(timelineActivities).toHaveLength(1);
    expect(timelineActivities[0]).toMatchObject({
      linkedRecordId: participant.messageId,
      timelineActivityTypeSnapshot: {
        action: 'linked',
        objectUniversalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
      },
    });
  }, 60000);

  it('creates a typed timeline activity when importing a calendar event for an existing person', async () => {
    const participants = await findParticipantLinks(
      'calendarEventParticipant',
      'calendarEventParticipants',
      KNOWN_ATTENDEE,
      'calendarEventId',
    );
    const [participant] = participants;

    expect(participants).toHaveLength(1);
    expect(participant.personId).toBe(attendeePersonId);

    const timelineActivities = await findLinkedTimelineActivities({
      personId: attendeePersonId,
      linkedRecordId: participant.calendarEventId,
    });

    expect(timelineActivities).toHaveLength(1);
    expect(timelineActivities[0]).toMatchObject({
      linkedRecordId: participant.calendarEventId,
      timelineActivityTypeSnapshot: {
        action: 'linked',
        objectUniversalIdentifier:
          STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      },
    });
  }, 60000);
});
