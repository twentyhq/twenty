import { CALENDAR_EVENT_GQL_FIELDS } from 'test/integration/constants/calendar-event-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';

const UNASSOCIATED_EVENT_ID = '20202020-ca1e-4000-8000-000000000001';

const METADATA_CHANNEL_IDS = [
  CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
  CALENDAR_CHANNEL_DATA_SEED_IDS.PHIL,
];
const SHARE_EVERYTHING_CHANNEL_IDS = [
  CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
  CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
  CALENDAR_CHANNEL_DATA_SEED_IDS.COMPANY_MAIN,
  CALENDAR_CHANNEL_DATA_SEED_IDS.TEAM_CALENDAR,
];

const EVENT_TITLE = 'Visibility test event';
const EVENT_DESCRIPTION = 'Visibility test description';

const MASKED_FIELDS = {
  title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
  description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
};

// Associations are not writable through the API, so the associated cases
// use seeded events, whose channel is picked at random by the seeder.
const findSeededEventIdOnChannels = async (calendarChannelIds: string[]) => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: 'calendarEventId',
      filter: { calendarChannelId: { in: calendarChannelIds } },
      first: 1,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  const calendarEventId =
    response.body.data.calendarChannelEventAssociations.edges[0]?.node
      .calendarEventId;

  expect(calendarEventId).toBeDefined();

  return calendarEventId as string;
};

const findCalendarEvent = async (id: string) => {
  const response = await makeGraphqlApiRequest(
    findOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      filter: { id: { eq: id } },
      gqlFields: CALENDAR_EVENT_GQL_FIELDS,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.calendarEvent;
};

describe('calendarEvent visibility restrictions (e2e)', () => {
  let metadataEventId: string;
  let sharedEventId: string;

  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        gqlFields: 'id',
        data: {
          id: UNASSOCIATED_EVENT_ID,
          title: EVENT_TITLE,
          description: EVENT_DESCRIPTION,
          isFullDay: false,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    metadataEventId = await findSeededEventIdOnChannels(METADATA_CHANNEL_IDS);
    sharedEventId = await findSeededEventIdOnChannels(
      SHARE_EVERYTHING_CHANNEL_IDS,
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        gqlFields: 'id',
        recordId: UNASSOCIATED_EVENT_ID,
      }),
    );
  });

  it('should mask events by channel visibility in findMany', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: CALENDAR_EVENT_GQL_FIELDS,
        filter: {
          id: { in: [UNASSOCIATED_EVENT_ID, metadataEventId, sharedEventId] },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const calendarEventsById = new Map(
      response.body.data.calendarEvents.edges.map(
        (edge: { node: { id: string } }) => [edge.node.id, edge.node],
      ),
    );

    expect(calendarEventsById.get(UNASSOCIATED_EVENT_ID)).toMatchObject(
      MASKED_FIELDS,
    );
    expect(calendarEventsById.get(metadataEventId)).toMatchObject(
      MASKED_FIELDS,
    );
    expect(
      (calendarEventsById.get(sharedEventId) as { title: string }).title,
    ).not.toBe(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED);
  });

  it('should mask an event without channel associations in findOne', async () => {
    expect(await findCalendarEvent(UNASSOCIATED_EVENT_ID)).toMatchObject(
      MASKED_FIELDS,
    );
  });

  it('should return a shared event unmasked in findOne', async () => {
    const calendarEvent = await findCalendarEvent(sharedEventId);

    expect(calendarEvent.title).not.toBe(
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    );
  });
});
