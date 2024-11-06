import { TIM_ACCOUNT_ID } from 'test/integration/graphql/integration.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID =
  '777a8457-eb2d-40ac-a707-551b615b6987';
const CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID =
  '777a8457-eb2d-40ac-a707-551b615b6988';
const CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID =
  '777a8457-eb2d-40ac-a707-551b615b6989';
const CALENDAR_EVENT_ID = '777a8457-eb2d-40ac-a707-221b615b6989';
const CALENDAR_CHANNEL_ID = '777a8457-eb2d-40ac-a707-331b615b6989';
const CONNECTED_ACCOUNT_ID = '777a8457-eb2d-40ac-a707-441b615b6989';

const CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS = `
  id
  eventExternalId
  createdAt
  updatedAt
  deletedAt
  calendarChannelId
  calendarEventId
`;

describe('calendarChannelEventAssociations resolvers (integration)', () => {
  beforeAll(async () => {
    const connectedAccountHandle = generateRecordName(CONNECTED_ACCOUNT_ID);
    const createConnectedAccountgraphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      data: {
        id: CONNECTED_ACCOUNT_ID,
        accountOwnerId: TIM_ACCOUNT_ID,
        handle: connectedAccountHandle,
      },
    });

    const calendarChannelHandle = generateRecordName(CALENDAR_CHANNEL_ID);
    const createCalendarChannelgraphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: `id`,
      data: {
        id: CALENDAR_CHANNEL_ID,
        handle: calendarChannelHandle,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      },
    });

    const calendarEventTitle = generateRecordName(CALENDAR_EVENT_ID);
    const createCalendarEventgraphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      gqlFields: `id`,
      data: {
        id: CALENDAR_EVENT_ID,
        title: calendarEventTitle,
      },
    });

    await makeGraphqlAPIRequest(createConnectedAccountgraphqlOperation);

    await makeGraphqlAPIRequest(createCalendarChannelgraphqlOperation);
    await makeGraphqlAPIRequest(createCalendarEventgraphqlOperation);
  });

  afterAll(async () => {
    const destroyConnectedAccountGraphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      recordId: CONNECTED_ACCOUNT_ID,
    });

    const destroyCalendarChannelGraphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: `id`,
      recordId: CALENDAR_CHANNEL_ID,
    });

    const destroyCalendarEventGraphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      gqlFields: `id`,
      recordId: CALENDAR_EVENT_ID,
    });

    await makeGraphqlAPIRequest(destroyConnectedAccountGraphqlOperation);
    await makeGraphqlAPIRequest(destroyCalendarChannelGraphqlOperation);
    await makeGraphqlAPIRequest(destroyCalendarEventGraphqlOperation);
  });

  it('1. should create and return calendarChannelEventAssociations', async () => {
    const eventExternalId1 = generateRecordName(
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
    );
    const eventExternalId2 = generateRecordName(
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
    );

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      data: [
        {
          id: CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
          eventExternalId: eventExternalId1,
          calendarChannelId: CALENDAR_CHANNEL_ID,
          calendarEventId: CALENDAR_EVENT_ID,
        },
        {
          id: CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          eventExternalId: eventExternalId2,
          calendarChannelId: CALENDAR_CHANNEL_ID,
          calendarEventId: CALENDAR_EVENT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.createCalendarChannelEventAssociations,
    ).toHaveLength(2);

    response.body.data.createCalendarChannelEventAssociations.forEach(
      (association) => {
        expect(association).toHaveProperty('eventExternalId');
        expect([eventExternalId1, eventExternalId2]).toContain(
          association.eventExternalId,
        );
        expect(association).toHaveProperty('id');
        expect(association).toHaveProperty('createdAt');
        expect(association).toHaveProperty('updatedAt');
        expect(association).toHaveProperty('deletedAt');
        expect(association).toHaveProperty('calendarChannelId');
        expect(association).toHaveProperty('calendarEventId');
      },
    );
  });

  it('1b. should create and return one calendarChannelEventAssociation', async () => {
    const eventExternalId = generateRecordName(
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
    );

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      data: {
        id: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
        eventExternalId: eventExternalId,
        calendarChannelId: CALENDAR_CHANNEL_ID,
        calendarEventId: CALENDAR_EVENT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdAssociation =
      response.body.data.createCalendarChannelEventAssociation;

    expect(createdAssociation).toHaveProperty('eventExternalId');
    expect(createdAssociation.eventExternalId).toEqual(eventExternalId);
    expect(createdAssociation).toHaveProperty('id');
    expect(createdAssociation).toHaveProperty('createdAt');
    expect(createdAssociation).toHaveProperty('updatedAt');
    expect(createdAssociation).toHaveProperty('deletedAt');
    expect(createdAssociation).toHaveProperty('calendarChannelId');
    expect(createdAssociation).toHaveProperty('calendarEventId');
  });

  it('2. should find many calendarChannelEventAssociations', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarChannelEventAssociations;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const associations = data.edges[0].node;

      expect(associations).toHaveProperty('eventExternalId');
      expect(associations).toHaveProperty('id');
      expect(associations).toHaveProperty('createdAt');
      expect(associations).toHaveProperty('updatedAt');
      expect(associations).toHaveProperty('deletedAt');
      expect(associations).toHaveProperty('calendarChannelId');
      expect(associations).toHaveProperty('calendarEventId');
    }
  });

  it('2b. should find one calendarChannelEventAssociation', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const association = response.body.data.calendarChannelEventAssociation;

    expect(association).toHaveProperty('eventExternalId');
    expect(association).toHaveProperty('id');
    expect(association).toHaveProperty('createdAt');
    expect(association).toHaveProperty('updatedAt');
    expect(association).toHaveProperty('deletedAt');
    expect(association).toHaveProperty('calendarChannelId');
    expect(association).toHaveProperty('calendarEventId');
  });

  it('3. should update many calendarChannelEventAssociations', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      data: {
        eventExternalId: 'updated-message-external-id',
      },
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAssociations =
      response.body.data.updateCalendarChannelEventAssociations;

    expect(updatedAssociations).toHaveLength(2);

    updatedAssociations.forEach((association) => {
      expect(association.eventExternalId).toEqual(
        'updated-message-external-id',
      );
    });
  });

  it('3b. should update one calendarChannelEventAssociation', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      data: {
        eventExternalId: 'new-message-external-id',
      },
      recordId: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAssociation =
      response.body.data.updateCalendarChannelEventAssociation;

    expect(updatedAssociation.eventExternalId).toEqual(
      'new-message-external-id',
    );
  });

  it('4. should find many calendarChannelEventAssociations with updated eventExternalId', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        eventExternalId: {
          eq: 'updated-message-external-id',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.calendarChannelEventAssociations.edges,
    ).toHaveLength(2);
  });

  it('4b. should find one calendarChannelEventAssociation with updated eventExternalId', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        eventExternalId: {
          eq: 'new-message-external-id',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.calendarChannelEventAssociation.eventExternalId,
    ).toEqual('new-message-external-id');
  });

  it('5. should delete many calendarChannelEventAssociations', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedAssociations =
      response.body.data.deleteCalendarChannelEventAssociations;

    expect(deletedAssociations).toHaveLength(2);

    deletedAssociations.forEach((association) => {
      expect(association.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one calendarChannelEventAssociation', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      recordId: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.deleteCalendarChannelEventAssociation.deletedAt,
    ).toBeTruthy();
  });

  it('6. should not find many calendarChannelEventAssociations anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const findAssociationsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findAssociationsResponse.body.data.calendarChannelEventAssociations.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one calendarChannelEventAssociation anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannelEventAssociation).toBeNull();
  });

  it('7. should find many deleted calendarChannelEventAssociations with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.calendarChannelEventAssociations.edges,
    ).toHaveLength(2);
  });

  it('7b. should find one deleted calendarChannelEventAssociation with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannelEventAssociation.id).toEqual(
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
    );
  });

  it('8. should destroy many calendarChannelEventAssociations', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.destroyCalendarChannelEventAssociations,
    ).toHaveLength(2);
  });

  it('8b. should destroy one calendarChannelEventAssociation', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      recordId: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
    });

    const destroyAssociationResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyAssociationResponse.body.data
        .destroyCalendarChannelEventAssociation,
    ).toBeTruthy();
  });

  it('9. should not find many calendarChannelEventAssociations anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      objectMetadataPluralName: 'calendarChannelEventAssociations',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_1_ID,
            CALENDAR_CHANNEL_EVENT_ASSOCIATION_2_ID,
          ],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.calendarChannelEventAssociations.edges,
    ).toHaveLength(0);
  });

  it('9b. should not find one calendarChannelEventAssociation anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannelEventAssociation',
      gqlFields: CALENDAR_CHANNEL_EVENT_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_EVENT_ASSOCIATION_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannelEventAssociation).toBeNull();
  });
});
