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

const HANDLE = 'gmail-participant-matching@apple.dev';

const UNMATCHED_HANDLE = `unmatched-${randomUUID()}@acme.com`;
const UNMATCHED_ATTENDEE = `attendee-${randomUUID()}@acme.com`;

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
    inbox: [gmailMessage({ from: UNMATCHED_HANDLE, to: HANDLE })],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
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
