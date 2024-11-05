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

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID =
  '777a8457-eb2d-40ac-a707-551b615b6987';
const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID =
  '777a8457-eb2d-40ac-a707-551b615b6988';
const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID =
  '777a8457-eb2d-40ac-a707-551b615b6989';

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS = `
    id
    messageExternalId
    createdAt
    updatedAt
    deletedAt
    messageChannelId
    messageId
    direction
`;

describe('messageChannelMessageAssociations resolvers (integration)', () => {
  it('1. should create and return messageChannelMessageAssociations', async () => {
    const messageExternalId1 = generateRecordName(
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
    );
    const messageExternalId2 = generateRecordName(
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
    );
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      data: [
        {
          id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
          messageExternalId: messageExternalId1,
        },
        {
          id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
          messageExternalId: messageExternalId2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.createMessageChannelMessageAssociations,
    ).toHaveLength(2);

    response.body.data.createMessageChannelMessageAssociations.forEach(
      (messageChannelMessageAssociation) => {
        expect(messageChannelMessageAssociation).toHaveProperty(
          'messageExternalId',
        );
        expect([messageExternalId1, messageExternalId2]).toContain(
          messageChannelMessageAssociation.messageExternalId,
        );

        expect(messageChannelMessageAssociation).toHaveProperty('id');
        expect(messageChannelMessageAssociation).toHaveProperty('createdAt');
        expect(messageChannelMessageAssociation).toHaveProperty('updatedAt');
        expect(messageChannelMessageAssociation).toHaveProperty('deletedAt');
        expect(messageChannelMessageAssociation).toHaveProperty(
          'messageChannelId',
        );
        expect(messageChannelMessageAssociation).toHaveProperty('messageId');
        expect(messageChannelMessageAssociation).toHaveProperty('direction');
      },
    );
  });

  it('1b. should create and return one messageChannelMessageAssociation', async () => {
    const messageExternalId3 = generateRecordName(
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
    );

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      data: {
        id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
        messageExternalId: messageExternalId3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdMessageChannelMessageAssociation =
      response.body.data.createMessageChannelMessageAssociation;

    expect(createdMessageChannelMessageAssociation).toHaveProperty(
      'messageExternalId',
    );
    expect(createdMessageChannelMessageAssociation.messageExternalId).toEqual(
      messageExternalId3,
    );

    expect(createdMessageChannelMessageAssociation).toHaveProperty('id');
    expect(createdMessageChannelMessageAssociation).toHaveProperty('createdAt');
    expect(createdMessageChannelMessageAssociation).toHaveProperty('updatedAt');
    expect(createdMessageChannelMessageAssociation).toHaveProperty('deletedAt');
    expect(createdMessageChannelMessageAssociation).toHaveProperty(
      'messageChannelId',
    );
    expect(createdMessageChannelMessageAssociation).toHaveProperty('messageId');
    expect(createdMessageChannelMessageAssociation).toHaveProperty('direction');
  });

  it('2. should find many messageChannelMessageAssociations', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.messageChannelMessageAssociations;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const messageChannelMessageAssociation = edges[0].node;

      expect(messageChannelMessageAssociation).toHaveProperty(
        'messageExternalId',
      );
      expect(messageChannelMessageAssociation).toHaveProperty('id');
      expect(messageChannelMessageAssociation).toHaveProperty('createdAt');
      expect(messageChannelMessageAssociation).toHaveProperty('updatedAt');
      expect(messageChannelMessageAssociation).toHaveProperty('deletedAt');
      expect(messageChannelMessageAssociation).toHaveProperty(
        'messageChannelId',
      );
      expect(messageChannelMessageAssociation).toHaveProperty('messageId');
      expect(messageChannelMessageAssociation).toHaveProperty('direction');
    }
  });

  it('2b. should find one messageChannelMessageAssociation', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const messageChannelMessageAssociation =
      response.body.data.messageChannelMessageAssociation;

    expect(messageChannelMessageAssociation).toHaveProperty(
      'messageExternalId',
    );

    expect(messageChannelMessageAssociation).toHaveProperty('id');
    expect(messageChannelMessageAssociation).toHaveProperty('createdAt');
    expect(messageChannelMessageAssociation).toHaveProperty('updatedAt');
    expect(messageChannelMessageAssociation).toHaveProperty('deletedAt');
    expect(messageChannelMessageAssociation).toHaveProperty('messageChannelId');
    expect(messageChannelMessageAssociation).toHaveProperty('messageId');
    expect(messageChannelMessageAssociation).toHaveProperty('direction');
  });

  it('3. should update many messageChannelMessageAssociations', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      data: {
        messageExternalId: 'updated-message-external-id',
      },
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedmessageChannelMessageAssociations =
      response.body.data.updateMessageChannelMessageAssociations;

    expect(updatedmessageChannelMessageAssociations).toHaveLength(2);

    updatedmessageChannelMessageAssociations.forEach(
      (messageChannelMessageAssociation) => {
        expect(messageChannelMessageAssociation.messageExternalId).toEqual(
          'updated-message-external-id',
        );
      },
    );
  });

  it('3b. should update one messageChannelMessageAssociation', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      data: {
        messageExternalId: 'new-message-external-id',
      },
      recordId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedmessageChannelMessageAssociation =
      response.body.data.updateMessageChannelMessageAssociation;

    expect(updatedmessageChannelMessageAssociation.messageExternalId).toEqual(
      'new-message-external-id',
    );
  });

  it('4. should find many messageChannelMessageAssociations with updated messageExternalId', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        messageExternalId: {
          eq: 'updated-message-external-id',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.messageChannelMessageAssociations.edges,
    ).toHaveLength(2);
  });

  it('4b. should find one messageChannelMessageAssociation with updated messageExternalId', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        messageExternalId: {
          eq: 'new-message-external-id',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.messageChannelMessageAssociation.messageExternalId,
    ).toEqual('new-message-external-id');
  });

  it('5. should delete many messageChannelMessageAssociations', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteMessageChannelMessageAssociations =
      response.body.data.deleteMessageChannelMessageAssociations;

    expect(deleteMessageChannelMessageAssociations).toHaveLength(2);

    deleteMessageChannelMessageAssociations.forEach(
      (messageChannelMessageAssociation) => {
        expect(messageChannelMessageAssociation.deletedAt).toBeTruthy();
      },
    );
  });

  it('5b. should delete one messageChannelMessageAssociation', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      recordId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.deleteMessageChannelMessageAssociation.deletedAt,
    ).toBeTruthy();
  });

  it('6. should not find many messageChannelMessageAssociations anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const findMessageChannelMessageAssociationsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findMessageChannelMessageAssociationsResponse.body.data
        .messageChannelMessageAssociations.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one messageChannelMessageAssociation anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannelMessageAssociation).toBeNull();
  });

  it('7. should find many deleted messageChannelMessageAssociations with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
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
      response.body.data.messageChannelMessageAssociations.edges,
    ).toHaveLength(2);
  });

  it('7b. should find one deleted messageChannelMessageAssociation with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannelMessageAssociation.id).toEqual(
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
    );
  });

  it('8. should destroy many messageChannelMessageAssociations', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
          ],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      response.body.data.destroyMessageChannelMessageAssociations,
    ).toHaveLength(2);
  });

  it('8b. should destroy one messageChannelMessageAssociation', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      recordId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
    });

    const destroyMessageChannelMessageAssociationResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyMessageChannelMessageAssociationResponse.body.data
        .destroyMessageChannelMessageAssociation,
    ).toBeTruthy();
  });

  it('9. should not find many messageChannelMessageAssociations anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      objectMetadataPluralName: 'messageChannelMessageAssociations',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          in: [
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1_ID,
            MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2_ID,
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
      response.body.data.messageChannelMessageAssociations.edges,
    ).toHaveLength(0);
  });

  it('9b. should not find one messageChannelMessageAssociation anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannelMessageAssociation',
      gqlFields: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannelMessageAssociation).toBeNull();
  });
});
