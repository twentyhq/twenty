import { randomUUID } from 'node:crypto';

import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-visibility@apple.dev';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

describe('Calendar channel visibility (integration)', () => {
  const eventTitle = `Calendar event ${randomUUID()}`;

  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const calendarEventQuery = () =>
    findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: 'title description',
      filter: { title: { eq: eventTitle } },
    });

  const readEventAs = async (
    makeRequest:
      | typeof makeGraphqlAPIRequest
      | typeof makeGraphqlAPIRequestWithMemberRole,
  ) => {
    const response = await makeRequest(calendarEventQuery());

    expect(response.body.errors).toBeUndefined();

    return response.body.data.calendarEvents.edges.map(
      (edge: { node: { title: string; description: string } }) => edge.node,
    );
  };

  const setVisibility = async (visibility: CalendarChannelVisibility) => {
    await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).update({ id: channel.calendarChannelId }, { visibility });
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: eventTitle,
        description: 'Agenda for the meeting',
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('shows the full event to another member when the channel shares everything', async () => {
    await setVisibility(CalendarChannelVisibility.SHARE_EVERYTHING);

    const [event] = await readEventAs(makeGraphqlAPIRequestWithMemberRole);

    expect(event.title).toBe(eventTitle);
    expect(event.description).not.toBe(RESTRICTED);
  }, 60000);

  it('masks the title and description for another member under metadata visibility', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const [event] = await readEventAs(makeGraphqlAPIRequestWithMemberRole);

    expect(event.title).toBe(RESTRICTED);
    expect(event.description).toBe(RESTRICTED);
  }, 60000);

  it('always shows the full event to the owner of the connected account', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const [event] = await readEventAs(makeGraphqlAPIRequest);

    expect(event.title).toBe(eventTitle);
    expect(event.description).not.toBe(RESTRICTED);
  }, 60000);
});
