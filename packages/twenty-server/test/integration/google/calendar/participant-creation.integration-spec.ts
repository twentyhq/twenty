import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'google-calendar-participant-creation@apple.dev';

const FIRST_EVENT_TITLE = `Calendar event first ${randomUUID()}`;
const SECOND_EVENT_TITLE = `Calendar event second ${randomUUID()}`;

const FIRST_EVENT_ATTENDEES = [
  `attendee-a1-${randomUUID()}@acme.com`,
  `attendee-a2-${randomUUID()}@acme.com`,
];
const MATCHED_ATTENDEE = `attendee-b1-${randomUUID()}@acme.com`;

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

describe('Calendar event participant creation (integration)', () => {
  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let matchedPersonId: string;

  beforeAll(async () => {
    matchedPersonId = await createPerson(MATCHED_ATTENDEE);

    await waitForAllJobsToFinish();

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).update(
      { id: channel.calendarChannelId },
      { isContactAutoCreationEnabled: false },
    );

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: FIRST_EVENT_TITLE,
        attendees: FIRST_EVENT_ATTENDEES.map((email) => ({ email })),
      }),
      googleCalendarEvent({
        summary: SECOND_EVENT_TITLE,
        attendees: [{ email: MATCHED_ATTENDEE }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('links every imported participant to the calendar event it was fetched for', async () => {
    const [firstEvent] = await findRecordNodesByFilter<{ id: string }>(
      'calendarEvent',
      'calendarEvents',
      'id',
      { title: { eq: FIRST_EVENT_TITLE } },
    );
    const [secondEvent] = await findRecordNodesByFilter<{ id: string }>(
      'calendarEvent',
      'calendarEvents',
      'id',
      { title: { eq: SECOND_EVENT_TITLE } },
    );

    expect(firstEvent).toBeDefined();
    expect(secondEvent).toBeDefined();

    const firstEventParticipants = await findRecordNodesByFilter<{
      handle: string;
      calendarEventId: string;
    }>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'handle calendarEventId',
      { calendarEventId: { eq: firstEvent.id } },
    );

    expect(
      firstEventParticipants.map((participant) => participant.handle).sort(),
    ).toEqual([...FIRST_EVENT_ATTENDEES].sort());
    for (const participant of firstEventParticipants) {
      expect(participant.calendarEventId).toBe(firstEvent.id);
    }

    const secondEventParticipants = await findRecordNodesByFilter<{
      handle: string;
      calendarEventId: string;
    }>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'handle calendarEventId',
      { calendarEventId: { eq: secondEvent.id } },
    );

    expect(secondEventParticipants).toHaveLength(1);
    expect(secondEventParticipants[0].handle).toBe(MATCHED_ATTENDEE);
    expect(secondEventParticipants[0].calendarEventId).toBe(secondEvent.id);
  }, 60000);

  it('assigns the matching person to the correct participant without mismatching the insert batch', async () => {
    const matchedParticipants = await findRecordNodesByFilter<{
      handle: string;
      personId: string | null;
    }>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'handle personId',
      { handle: { eq: MATCHED_ATTENDEE } },
    );

    expect(matchedParticipants).toHaveLength(1);
    expect(matchedParticipants[0].personId).toBe(matchedPersonId);

    const unmatchedParticipants = await findRecordNodesByFilter<{
      handle: string;
      personId: string | null;
    }>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'handle personId',
      { handle: { in: FIRST_EVENT_ATTENDEES } },
    );

    expect(unmatchedParticipants).toHaveLength(FIRST_EVENT_ATTENDEES.length);
    for (const participant of unmatchedParticipants) {
      expect(participant.personId).toBeNull();
    }
  }, 60000);
});
