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

const BLOCKLIST_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const BLOCKLIST_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const BLOCKLIST_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const BLOCKLIST_HANDLE_1 = 'email@email.com';
const BLOCKLIST_HANDLE_2 = '@domain.com';
const BLOCKLIST_HANDLE_3 = '@domain.org';
const UPDATED_BLOCKLIST_HANDLE_1 = 'updated@email.com';
const UPDATED_BLOCKLIST_HANDLE_2 = '@updated-domain.com';

const BLOCKLIST_GQL_FIELDS = `
  id
  handle
  createdAt
  updatedAt
  deletedAt
  workspaceMemberId
`;

describe('blocklists resolvers (integration)', () => {
  it('1. should create and return blocklists', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: [
        {
          id: BLOCKLIST_1_ID,
          handle: BLOCKLIST_HANDLE_1,
          workspaceMemberId: TIM_ACCOUNT_ID,
        },
        {
          id: BLOCKLIST_2_ID,
          handle: BLOCKLIST_HANDLE_2,
          workspaceMemberId: TIM_ACCOUNT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createBlocklists).toHaveLength(2);

    response.body.data.createBlocklists.forEach((blocklist) => {
      expect(blocklist).toHaveProperty('handle');
      expect([BLOCKLIST_HANDLE_1, BLOCKLIST_HANDLE_2]).toContain(
        blocklist.handle,
      );
      expect(blocklist).toHaveProperty('id');
      expect(blocklist).toHaveProperty('createdAt');
      expect(blocklist).toHaveProperty('updatedAt');
      expect(blocklist).toHaveProperty('deletedAt');
      expect(blocklist).toHaveProperty('workspaceMemberId');
    });
  });

  it('1b. should create and return one blocklist', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: {
        id: BLOCKLIST_3_ID,
        handle: BLOCKLIST_HANDLE_3,
        workspaceMemberId: TIM_ACCOUNT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdBlocklist = response.body.data.createBlocklist;

    expect(createdBlocklist).toHaveProperty('handle');
    expect(createdBlocklist.handle).toEqual(BLOCKLIST_HANDLE_3);
    expect(createdBlocklist).toHaveProperty('id');
    expect(createdBlocklist).toHaveProperty('createdAt');
    expect(createdBlocklist).toHaveProperty('updatedAt');
    expect(createdBlocklist).toHaveProperty('deletedAt');
    expect(createdBlocklist).toHaveProperty('workspaceMemberId');
  });

  it('2. should find many blocklists', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.blocklists;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const blocklists = data.edges[0].node;

      expect(blocklists).toHaveProperty('handle');
      expect(blocklists).toHaveProperty('id');
      expect(blocklists).toHaveProperty('createdAt');
      expect(blocklists).toHaveProperty('updatedAt');
      expect(blocklists).toHaveProperty('deletedAt');
      expect(blocklists).toHaveProperty('workspaceMemberId');
    }
  });

  it('2b. should find one blocklist', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          eq: BLOCKLIST_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const blocklist = response.body.data.blocklist;

    expect(blocklist).toHaveProperty('handle');
    expect(blocklist).toHaveProperty('id');
    expect(blocklist).toHaveProperty('createdAt');
    expect(blocklist).toHaveProperty('updatedAt');
    expect(blocklist).toHaveProperty('deletedAt');
    expect(blocklist).toHaveProperty('workspaceMemberId');
  });

  it('3. should not update many blocklists', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: {
        handle: UPDATED_BLOCKLIST_HANDLE_1,
        workspaceMemberId: TIM_ACCOUNT_ID,
      },
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.updateBlocklists).toBeNull();
    expect(response.body.errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        message: 'Method not allowed.',
      },
    ]);
  });

  it('3b. should update one blocklist', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      data: {
        handle: UPDATED_BLOCKLIST_HANDLE_2,
        workspaceMemberId: TIM_ACCOUNT_ID,
      },
      recordId: BLOCKLIST_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedBlocklist = response.body.data.updateBlocklist;

    expect(updatedBlocklist.handle).toEqual(UPDATED_BLOCKLIST_HANDLE_2);
  });

  it('4. should not find many blocklists with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        handle: {
          eq: UPDATED_BLOCKLIST_HANDLE_1,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklists.edges).toHaveLength(0);
  });

  it('4b. should find one blocklist with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        handle: {
          eq: UPDATED_BLOCKLIST_HANDLE_2,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklist.handle).toEqual(
      UPDATED_BLOCKLIST_HANDLE_2,
    );
  });

  it('5. should delete many blocklists', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedBlocklists = response.body.data.deleteBlocklists;

    expect(deletedBlocklists).toHaveLength(2);

    deletedBlocklists.forEach((blocklist) => {
      expect(blocklist.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one blocklist', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      recordId: BLOCKLIST_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteBlocklist.deletedAt).toBeTruthy();
  });

  it('6. should not find many blocklists anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
      },
    });

    const findBlocklistsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findBlocklistsResponse.body.data.blocklists.edges).toHaveLength(0);
  });

  it('6b. should not find one blocklist anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          eq: BLOCKLIST_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklist).toBeNull();
  });

  it('7. should find many deleted blocklists with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklists.edges).toHaveLength(2);
  });

  it('7b. should find one deleted blocklist with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          eq: BLOCKLIST_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklist.id).toEqual(BLOCKLIST_3_ID);
  });

  it('8. should destroy many blocklists', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyBlocklists).toHaveLength(2);
  });

  it('8b. should destroy one blocklist', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      recordId: BLOCKLIST_3_ID,
    });

    const destroyBlocklistResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyBlocklistResponse.body.data.destroyBlocklist).toBeTruthy();
  });

  it('9. should not find many blocklists anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          in: [BLOCKLIST_1_ID, BLOCKLIST_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklists.edges).toHaveLength(0);
  });

  it('9b. should not find one blocklist anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: BLOCKLIST_GQL_FIELDS,
      filter: {
        id: {
          eq: BLOCKLIST_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.blocklist).toBeNull();
  });
});
