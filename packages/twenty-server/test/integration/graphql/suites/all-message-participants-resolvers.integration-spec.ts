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

const MESSAGE_PARTICIPANT_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const MESSAGE_PARTICIPANT_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const MESSAGE_PARTICIPANT_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const MESSAGE_ID = '777a8457-eb2d-40ac-a707-441b615b6989';
const MESSAGE_PARTICIPANT_GQL_FIELDS = `
    id
    displayName
    handle
    role
    messageId
    workspaceMemberId
    createdAt
    deletedAt
`;

describe('messageParticipants resolvers (integration)', () => {
  beforeAll(async () => {
    const messageSubject = generateRecordName(MESSAGE_ID);
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: `id`,
      data: {
        id: MESSAGE_ID,
        subject: messageSubject,
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  afterAll(async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: `id`,
      recordId: MESSAGE_ID,
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  it('1. should create and return messageParticipants', async () => {
    const messageParticipantDisplayName1 = generateRecordName(
      MESSAGE_PARTICIPANT_1_ID,
    );
    const messageParticipantDisplayName2 = generateRecordName(
      MESSAGE_PARTICIPANT_2_ID,
    );

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      data: [
        {
          id: MESSAGE_PARTICIPANT_1_ID,
          displayName: messageParticipantDisplayName1,
          messageId: MESSAGE_ID,
        },
        {
          id: MESSAGE_PARTICIPANT_2_ID,
          displayName: messageParticipantDisplayName2,
          messageId: MESSAGE_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createMessageParticipants).toHaveLength(2);

    response.body.data.createMessageParticipants.forEach(
      (messageParticipant) => {
        expect(messageParticipant).toHaveProperty('displayName');
        expect([
          messageParticipantDisplayName1,
          messageParticipantDisplayName2,
        ]).toContain(messageParticipant.displayName);

        expect(messageParticipant).toHaveProperty('id');
        expect(messageParticipant).toHaveProperty('handle');
        expect(messageParticipant).toHaveProperty('role');
        expect(messageParticipant).toHaveProperty('messageId');
        expect(messageParticipant).toHaveProperty('workspaceMemberId');
        expect(messageParticipant).toHaveProperty('createdAt');
        expect(messageParticipant).toHaveProperty('deletedAt');
      },
    );
  });

  it('1b. should create and return one messageParticipant', async () => {
    const messageParticipantDisplayName = generateRecordName(
      MESSAGE_PARTICIPANT_3_ID,
    );

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      data: {
        id: MESSAGE_PARTICIPANT_3_ID,
        displayName: messageParticipantDisplayName,
        messageId: MESSAGE_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdMessageParticipant =
      response.body.data.createMessageParticipant;

    expect(createdMessageParticipant).toHaveProperty('displayName');
    expect(createdMessageParticipant.displayName).toEqual(
      messageParticipantDisplayName,
    );

    expect(createdMessageParticipant).toHaveProperty('id');
    expect(createdMessageParticipant).toHaveProperty('handle');
    expect(createdMessageParticipant).toHaveProperty('role');
    expect(createdMessageParticipant).toHaveProperty('messageId');
    expect(createdMessageParticipant).toHaveProperty('workspaceMemberId');
    expect(createdMessageParticipant).toHaveProperty('createdAt');
    expect(createdMessageParticipant).toHaveProperty('deletedAt');
  });

  it('2. should find many messageParticipants', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.messageParticipants;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const messageParticipant = edges[0].node;

      expect(messageParticipant).toHaveProperty('displayName');
      expect(messageParticipant).toHaveProperty('id');
      expect(messageParticipant).toHaveProperty('handle');
      expect(messageParticipant).toHaveProperty('role');
      expect(messageParticipant).toHaveProperty('messageId');
      expect(messageParticipant).toHaveProperty('workspaceMemberId');
      expect(messageParticipant).toHaveProperty('createdAt');
      expect(messageParticipant).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one messageParticipant', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_PARTICIPANT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const messageParticipant = response.body.data.messageParticipant;

    expect(messageParticipant).toHaveProperty('displayName');

    expect(messageParticipant).toHaveProperty('id');
    expect(messageParticipant).toHaveProperty('handle');
    expect(messageParticipant).toHaveProperty('role');
    expect(messageParticipant).toHaveProperty('messageId');
    expect(messageParticipant).toHaveProperty('workspaceMemberId');
    expect(messageParticipant).toHaveProperty('createdAt');
    expect(messageParticipant).toHaveProperty('deletedAt');
  });

  it('3. should update many messageParticipants', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      data: {
        displayName: 'New DisplayName',
      },
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedmessageParticipants =
      response.body.data.updateMessageParticipants;

    expect(updatedmessageParticipants).toHaveLength(2);

    updatedmessageParticipants.forEach((messageParticipant) => {
      expect(messageParticipant.displayName).toEqual('New DisplayName');
    });
  });

  it('3b. should update one messageParticipant', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      data: {
        displayName: 'Updated DisplayName',
      },
      recordId: MESSAGE_PARTICIPANT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedmessageParticipant =
      response.body.data.updateMessageParticipant;

    expect(updatedmessageParticipant.displayName).toEqual(
      'Updated DisplayName',
    );
  });

  it('4. should find many messageParticipants with updated displayName', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        displayName: {
          eq: 'New DisplayName',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipants.edges).toHaveLength(2);
  });

  it('4b. should find one messageParticipant with updated displayName', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        displayName: {
          eq: 'Updated DisplayName',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipant.displayName).toEqual(
      'Updated DisplayName',
    );
  });

  it('5. should delete many messageParticipants', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteMessageParticipants =
      response.body.data.deleteMessageParticipants;

    expect(deleteMessageParticipants).toHaveLength(2);

    deleteMessageParticipants.forEach((messageParticipant) => {
      expect(messageParticipant.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one messageParticipant', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      recordId: MESSAGE_PARTICIPANT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteMessageParticipant.deletedAt).toBeTruthy();
  });

  it('6. should not find many messageParticipants anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
      },
    });

    const findMessageParticipantsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findMessageParticipantsResponse.body.data.messageParticipants.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one messageParticipant anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_PARTICIPANT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipant).toBeNull();
  });

  it('7. should find many deleted messageParticipants with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipants.edges).toHaveLength(2);
  });

  it('7b. should find one deleted messageParticipant with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_PARTICIPANT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipant.id).toEqual(
      MESSAGE_PARTICIPANT_3_ID,
    );
  });

  it('8. should destroy many messageParticipants', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyMessageParticipants).toHaveLength(2);
  });

  it('8b. should destroy one messageParticipant', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      recordId: MESSAGE_PARTICIPANT_3_ID,
    });

    const destroyMessageParticipantResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyMessageParticipantResponse.body.data.destroyMessageParticipant,
    ).toBeTruthy();
  });

  it('9. should not find many messageParticipants anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      objectMetadataPluralName: 'messageParticipants',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_PARTICIPANT_1_ID, MESSAGE_PARTICIPANT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipants.edges).toHaveLength(0);
  });

  it('9b. should not find one messageParticipant anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageParticipant',
      gqlFields: MESSAGE_PARTICIPANT_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_PARTICIPANT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageParticipant).toBeNull();
  });
});
