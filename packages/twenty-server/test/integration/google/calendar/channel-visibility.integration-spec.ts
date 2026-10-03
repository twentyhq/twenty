import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { updateCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-visibility@apple.dev';
const ATTENDEE_HANDLE = `attendee-${randomUUID()}@acme.com`;

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

type MakeRequest =
  | typeof makeGraphqlApiRequest
  | typeof makeGraphqlApiRequestWithMemberRole;

// Jane (admin) connects the account; Jony (member) is the other member.
describe('Calendar event access from channel visibility (integration)', () => {
  const eventTitle = `Calendar event ${randomUUID()}`;

  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let attendeePersonId: string;
  let calendarEventId: string;

  const readEvents = async (makeRequest: MakeRequest) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: 'id title description',
        filter: { id: { eq: calendarEventId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.calendarEvents.edges.map(
      (edge: { node: { id: string; title: string; description: string } }) =>
        edge.node,
    );
  };

  const discoverEvents = (gqlFields: string) =>
    makeGraphqlApiRequestWithMemberRole({
      query: gql`
        query DiscoverCalendarEvents($id: UUID) {
          calendarEvents(discover: true, filter: { id: { eq: $id } }) {
            edges {
              node {
                ${gqlFields}
              }
            }
          }
        }
      `,
      variables: { id: calendarEventId },
    });

  const readTimeline = async (makeRequest: MakeRequest) => {
    const response = await makeRequest({
      query: gql`
        query GetTimelineCalendarEventsFromObjectRecord($recordId: UUID!) {
          getTimelineCalendarEventsFromObjectRecord(
            objectNameSingular: "person"
            recordId: $recordId
            page: 1
            pageSize: 10
          ) {
            totalNumberOfCalendarEvents
            timelineCalendarEvents {
              id
              title
              description
              visibility
              startsAt
            }
          }
        }
      `,
      variables: { recordId: attendeePersonId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.getTimelineCalendarEventsFromObjectRecord;
  };

  const setVisibility = (visibility: CalendarChannelVisibility) =>
    updateCalendarChannel(channel.calendarChannelId, { visibility });

  beforeAll(async () => {
    const personResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: ATTENDEE_HANDLE } },
      }),
    );

    attendeePersonId = personResponse.body.data.createPerson.id;

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: eventTitle,
        description: 'Agenda for the meeting',
        attendees: [{ email: ATTENDEE_HANDLE, responseStatus: 'accepted' }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: 'id',
        filter: { title: { eq: eventTitle } },
      }),
    );

    calendarEventId = response.body.data.calendarEvents.edges[0].node.id;
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);

    if (isDefined(attendeePersonId)) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: attendeePersonId,
        }),
      ).catch(() => undefined);
    }
  });

  it('shows the event to another member when the channel shares everything', async () => {
    await setVisibility(CalendarChannelVisibility.SHARE_EVERYTHING);

    const [event] = await readEvents(makeGraphqlApiRequestWithMemberRole);

    expect(event.title).toBe(eventTitle);
    expect(event.description).toBe('Agenda for the meeting');
  }, 60000);

  it('hides the event from another member under metadata visibility', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    expect(await readEvents(makeGraphqlApiRequestWithMemberRole)).toEqual([]);
  }, 60000);

  it('always shows the event to the member who synced it', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const [event] = await readEvents(makeGraphqlApiRequest);

    expect(event.title).toBe(eventTitle);
  }, 60000);

  it('lets another member discover when an unshared event happened', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const response = await discoverEvents(
      'id startsAt endsAt calendarEventParticipants { edges { node { handle } } }',
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.calendarEvents.edges).toEqual([
      {
        node: {
          id: calendarEventId,
          startsAt: expect.any(String),
          endsAt: expect.any(String),
          calendarEventParticipants: {
            edges: expect.arrayContaining([
              { node: { handle: ATTENDEE_HANDLE } },
            ]),
          },
        },
      },
    ]);
  }, 60000);

  it('refuses to discover the title of an unshared event', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const response = await discoverEvents('id title');

    expect(response.body.errors?.[0]?.message).toContain('title');
  }, 60000);

  it('shows an unshared event on another member timeline without its content', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    expect(await readTimeline(makeGraphqlApiRequestWithMemberRole)).toEqual({
      totalNumberOfCalendarEvents: 1,
      timelineCalendarEvents: [
        {
          id: calendarEventId,
          title: RESTRICTED,
          description: RESTRICTED,
          visibility: CalendarChannelVisibility.METADATA,
          startsAt: expect.any(String),
        },
      ],
    });
  }, 60000);

  it('shows the content on the timeline to the member who synced it', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const { timelineCalendarEvents } = await readTimeline(
      makeGraphqlApiRequest,
    );

    expect(timelineCalendarEvents).toEqual([
      expect.objectContaining({
        id: calendarEventId,
        title: eventTitle,
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      }),
    ]);
  }, 60000);
});
