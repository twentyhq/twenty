import { CALENDAR_EVENT_GQL_FIELDS } from 'test/integration/constants/calendar-event-gql-fields.constants';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { DEV_SEED_CALENDAR_EVENT_IDS } from 'src/database/typeorm-seeds/workspace/calendar-events';

describe('calendarEventsResolver (e2e)', () => {
  it('should find many calendarEvents', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: CALENDAR_EVENT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarEvents;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const calendarEvent = edges[0].node;

      expect(calendarEvent).toMatchSnapshot({
        id: DEV_SEED_CALENDAR_EVENT_IDS.CALENDAR_EVENT_1,
        title: expect.any(String),
        description: expect.any(String),
        endsAt: expect.any(String),
        startsAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    }
  });

  it('should find one calendarEvent', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      filter: { id: { eq: DEV_SEED_CALENDAR_EVENT_IDS.CALENDAR_EVENT_1 } },
      gqlFields: CALENDAR_EVENT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarEvent;

    expect(data).toBeDefined();
    expect(data).toMatchSnapshot({
      id: DEV_SEED_CALENDAR_EVENT_IDS.CALENDAR_EVENT_1,
      title: expect.any(String),
      description: expect.any(String),
      endsAt: expect.any(String),
      startsAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
