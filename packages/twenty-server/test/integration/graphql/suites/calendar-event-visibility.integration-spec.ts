import { CALENDAR_EVENT_GQL_FIELDS } from 'test/integration/constants/calendar-event-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';

const UNASSOCIATED_EVENT_ID = '20202020-ca1e-4000-8000-000000000001';
const METADATA_EVENT_ID = '20202020-ca1e-4000-8000-000000000002';
const SHARED_EVENT_ID = '20202020-ca1e-4000-8000-000000000003';
const METADATA_ASSOCIATION_ID = '20202020-ca1e-4000-8000-000000000004';
const SHARED_ASSOCIATION_ID = '20202020-ca1e-4000-8000-000000000005';

const EVENT_TITLE = 'Visibility test event';
const EVENT_DESCRIPTION = 'Visibility test description';

const MASKED_FIELDS = {
  title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
  description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
};

// Destroyed in afterAll in child-before-parent order to satisfy foreign keys.
const FIXTURES: { objectMetadataSingularName: string; id: string }[] = [
  {
    objectMetadataSingularName: 'calendarChannelEventAssociation',
    id: METADATA_ASSOCIATION_ID,
  },
  {
    objectMetadataSingularName: 'calendarChannelEventAssociation',
    id: SHARED_ASSOCIATION_ID,
  },
  { objectMetadataSingularName: 'calendarEvent', id: UNASSOCIATED_EVENT_ID },
  { objectMetadataSingularName: 'calendarEvent', id: METADATA_EVENT_ID },
  { objectMetadataSingularName: 'calendarEvent', id: SHARED_EVENT_ID },
];

const createRecord = async (
  objectMetadataSingularName: string,
  data: Record<string, unknown>,
) => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const createCalendarEvent = (id: string) =>
  createRecord('calendarEvent', {
    id,
    title: EVENT_TITLE,
    description: EVENT_DESCRIPTION,
    isFullDay: false,
    startsAt: new Date().toISOString(),
    endsAt: new Date().toISOString(),
  });

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
  beforeAll(async () => {
    await createCalendarEvent(UNASSOCIATED_EVENT_ID);
    await createCalendarEvent(METADATA_EVENT_ID);
    await createCalendarEvent(SHARED_EVENT_ID);

    // Tim's channel is METADATA and not owned by Jane, the requesting user.
    await createRecord('calendarChannelEventAssociation', {
      id: METADATA_ASSOCIATION_ID,
      calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
      calendarEventId: METADATA_EVENT_ID,
      eventExternalId: 'visibility-test-metadata-event',
    });

    await createRecord('calendarChannelEventAssociation', {
      id: SHARED_ASSOCIATION_ID,
      calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.TEAM_CALENDAR,
      calendarEventId: SHARED_EVENT_ID,
      eventExternalId: 'visibility-test-shared-event',
    });
  });

  afterAll(async () => {
    for (const { objectMetadataSingularName, id } of FIXTURES) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('should mask events by channel visibility in findMany', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: CALENDAR_EVENT_GQL_FIELDS,
        filter: {
          id: {
            in: [UNASSOCIATED_EVENT_ID, METADATA_EVENT_ID, SHARED_EVENT_ID],
          },
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
    expect(calendarEventsById.get(METADATA_EVENT_ID)).toMatchObject(
      MASKED_FIELDS,
    );
    expect(calendarEventsById.get(SHARED_EVENT_ID)).toMatchObject({
      title: EVENT_TITLE,
      description: EVENT_DESCRIPTION,
    });
  });

  it('should mask an event without channel associations in findOne', async () => {
    expect(await findCalendarEvent(UNASSOCIATED_EVENT_ID)).toMatchObject(
      MASKED_FIELDS,
    );
  });

  it('should return a shared event unmasked in findOne', async () => {
    expect(await findCalendarEvent(SHARED_EVENT_ID)).toMatchObject({
      title: EVENT_TITLE,
      description: EVENT_DESCRIPTION,
    });
  });
});
