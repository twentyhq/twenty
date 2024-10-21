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

const CALENDAR_EVENT_PARTICIPANT_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const CALENDAR_EVENT_PARTICIPANT_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const CALENDAR_EVENT_PARTICIPANT_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const CALENDAR_EVENT_ID = '777a8457-eb2d-40ac-a707-441b615b6989';
const CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS = `
    id
    handle
    displayName
    isOrganizer
    responseStatus
    deletedAt
`;

describe('calendarEventParticipants resolvers (integration)', () => {
  beforeAll(async () => {
    const calendarEventTitle = generateRecordName(CALENDAR_EVENT_ID);
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      gqlFields: `id`,
      data: {
        id: CALENDAR_EVENT_ID,
        title: calendarEventTitle,
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  afterAll(async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      gqlFields: `id`,
      recordId: CALENDAR_EVENT_ID,
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  it('1. should create and return calendarEventParticipants', async () => {
    const calendarEventParticipantDisplayName1 = generateRecordName(
      CALENDAR_EVENT_PARTICIPANT_1_ID,
    );
    const calendarEventParticipantDisplayName2 = generateRecordName(
      CALENDAR_EVENT_PARTICIPANT_2_ID,
    );

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      data: [
        {
          id: CALENDAR_EVENT_PARTICIPANT_1_ID,
          displayName: calendarEventParticipantDisplayName1,
          calendarEventId: CALENDAR_EVENT_ID,
        },
        {
          id: CALENDAR_EVENT_PARTICIPANT_2_ID,
          displayName: calendarEventParticipantDisplayName2,
          calendarEventId: CALENDAR_EVENT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCalendarEventParticipants).toHaveLength(2);

    response.body.data.createCalendarEventParticipants.forEach(
      (calendarEventParticipant) => {
        expect(calendarEventParticipant).toHaveProperty('displayName');
        expect([
          calendarEventParticipantDisplayName1,
          calendarEventParticipantDisplayName2,
        ]).toContain(calendarEventParticipant.displayName);

        expect(calendarEventParticipant).toHaveProperty('id');
        expect(calendarEventParticipant).toHaveProperty('handle');
        expect(calendarEventParticipant).toHaveProperty('isOrganizer');
        expect(calendarEventParticipant).toHaveProperty('responseStatus');
        expect(calendarEventParticipant).toHaveProperty('deletedAt');
      },
    );
  });

  it('1b. should create and return one calendarEventParticipant', async () => {
    const calendarEventParticipantDisplayName = generateRecordName(
      CALENDAR_EVENT_PARTICIPANT_3_ID,
    );

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      data: {
        id: CALENDAR_EVENT_PARTICIPANT_3_ID,
        displayName: calendarEventParticipantDisplayName,
        calendarEventId: CALENDAR_EVENT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdCalendarEventParticipant =
      response.body.data.createCalendarEventParticipant;

    expect(createdCalendarEventParticipant).toHaveProperty('displayName');
    expect(createdCalendarEventParticipant.displayName).toEqual(
      calendarEventParticipantDisplayName,
    );

    expect(createdCalendarEventParticipant).toHaveProperty('id');
    expect(createdCalendarEventParticipant).toHaveProperty('handle');
    expect(createdCalendarEventParticipant).toHaveProperty('isOrganizer');
    expect(createdCalendarEventParticipant).toHaveProperty('responseStatus');
    expect(createdCalendarEventParticipant).toHaveProperty('deletedAt');
  });

  it('2. should find many calendarEventParticipants', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarEventParticipants;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const calendarEventParticipants = edges[0].node;

      expect(calendarEventParticipants).toHaveProperty('displayName');
      expect(calendarEventParticipants).toHaveProperty('id');
      expect(calendarEventParticipants).toHaveProperty('handle');
      expect(calendarEventParticipants).toHaveProperty('isOrganizer');
      expect(calendarEventParticipants).toHaveProperty('responseStatus');
      expect(calendarEventParticipants).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one calendarEventParticipant', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_EVENT_PARTICIPANT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const calendarEventParticipant =
      response.body.data.calendarEventParticipant;

    expect(calendarEventParticipant).toHaveProperty('displayName');

    expect(calendarEventParticipant).toHaveProperty('id');
    expect(calendarEventParticipant).toHaveProperty('handle');
    expect(calendarEventParticipant).toHaveProperty('isOrganizer');
    expect(calendarEventParticipant).toHaveProperty('responseStatus');
    expect(calendarEventParticipant).toHaveProperty('deletedAt');
  });

  it('3. should update many calendarEventParticipants', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      data: {
        displayName: 'New DisplayName',
      },
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedcalendarEventParticipants =
      response.body.data.updateCalendarEventParticipants;

    expect(updatedcalendarEventParticipants).toHaveLength(2);

    updatedcalendarEventParticipants.forEach((calendarEventParticipant) => {
      expect(calendarEventParticipant.displayName).toEqual('New DisplayName');
    });
  });

  it('3b. should update one calendarEventParticipant', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      data: {
        displayName: 'Updated DisplayName',
      },
      recordId: CALENDAR_EVENT_PARTICIPANT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedcalendarEventParticipant =
      response.body.data.updateCalendarEventParticipant;

    expect(updatedcalendarEventParticipant.displayName).toEqual(
      'Updated DisplayName',
    );
  });

  it('4. should find many calendarEventParticipants with updated displayName', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        displayName: {
          eq: 'New DisplayName',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarEventParticipants.edges).toHaveLength(2);
  });

  it('4b. should find one calendarEventParticipant with updated displayName', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        displayName: {
          eq: 'Updated DisplayName',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarEventParticipant.displayName).toEqual(
      'Updated DisplayName',
    );
  });

  it('5. should delete many calendarEventParticipants', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteCalendarEventParticipants =
      response.body.data.deleteCalendarEventParticipants;

    expect(deleteCalendarEventParticipants).toHaveLength(2);

    deleteCalendarEventParticipants.forEach((calendarEventParticipant) => {
      expect(calendarEventParticipant.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one calendarEventParticipant', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      recordId: CALENDAR_EVENT_PARTICIPANT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.deleteCalendarEventParticipant.deletedAt,
    ).toBeTruthy();
  });

  it('6. should not find many calendarEventParticipants anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
          ],
        },
      },
    });

    const findCalendarEventParticipantsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findCalendarEventParticipantsResponse.body.data.calendarEventParticipants
        .edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one calendarEventParticipant anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_EVENT_PARTICIPANT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarEventParticipant).toBeNull();
  });

  it('7. should find many deleted calendarEventParticipants with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
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

    expect(response.body.data.calendarEventParticipants.edges).toHaveLength(2);
  });

  it('7b. should find one deleted calendarEventParticipant with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_EVENT_PARTICIPANT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarEventParticipant.id).toEqual(
      CALENDAR_EVENT_PARTICIPANT_3_ID,
    );
  });

  it('8. should destroy many calendarEventParticipants', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyCalendarEventParticipants).toHaveLength(2);
  });

  it('8b. should destroy one calendarEventParticipant', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      recordId: CALENDAR_EVENT_PARTICIPANT_3_ID,
    });

    const destroyCalendarEventParticipantResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyCalendarEventParticipantResponse.body.data
        .destroyCalendarEventParticipant,
    ).toBeTruthy();
  });

  it('9. should not find many calendarEventParticipants anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      objectMetadataPluralName: 'calendarEventParticipants',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [
            CALENDAR_EVENT_PARTICIPANT_1_ID,
            CALENDAR_EVENT_PARTICIPANT_2_ID,
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

    expect(response.body.data.calendarEventParticipants.edges).toHaveLength(0);
  });

  it('9b. should not find one calendarEventParticipant anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEventParticipant',
      gqlFields: CALENDAR_EVENT_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_EVENT_PARTICIPANT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarEventParticipant).toBeNull();
  });
});
