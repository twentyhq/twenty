import { MESSAGE_GQL_FIELDS } from 'test/integration/constants/message-gql-fields.constants';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { DEV_SEED_MESSAGE_IDS } from 'src/database/typeorm-seeds/workspace/messages';

describe('messagesResolver (e2e)', () => {
  it('should find many messages', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'message',
      objectMetadataPluralName: 'messages',
      gqlFields: MESSAGE_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.messages;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    expect(edges.length).toEqual(3);

    const message1 = edges[0].node;

    expect(message1).toMatchSnapshot({
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should find one message', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'message',
      filter: { id: { eq: DEV_SEED_MESSAGE_IDS.MESSAGE_1 } },
      gqlFields: MESSAGE_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.message;

    expect(data).toBeDefined();
    expect(data).toMatchSnapshot({
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
