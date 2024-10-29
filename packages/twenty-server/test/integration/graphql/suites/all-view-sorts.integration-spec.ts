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

const VIEW_SORT_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const VIEW_SORT_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const VIEW_SORT_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const FIELD_METADATA_ID = '20202020-0c28-43d8-8ba5-3659924d3489';

const VIEW_SORT_GQL_FIELDS = `
  id
  fieldMetadataId
  direction
  createdAt
  updatedAt
  deletedAt
  viewId
`;

describe('viewSorts resolvers (integration)', () => {
  it('1. should create and return viewSorts', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      data: [
        {
          id: VIEW_SORT_1_ID,
          fieldMetadataId: FIELD_METADATA_ID,
          direction: 'ASC',
        },
        {
          id: VIEW_SORT_2_ID,
          fieldMetadataId: FIELD_METADATA_ID,
          direction: 'DESC',
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createViewSorts).toHaveLength(2);

    response.body.data.createViewSorts.forEach((viewSort) => {
      expect(viewSort).toHaveProperty('fieldMetadataId');
      expect(viewSort.fieldMetadataId).toEqual(FIELD_METADATA_ID);
      expect(viewSort).toHaveProperty('direction');
      expect(viewSort).toHaveProperty('id');
      expect(viewSort).toHaveProperty('createdAt');
      expect(viewSort).toHaveProperty('updatedAt');
      expect(viewSort).toHaveProperty('deletedAt');
      expect(viewSort).toHaveProperty('viewId');
    });
  });

  it('1b. should create and return one viewSort', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      data: {
        id: VIEW_SORT_3_ID,
        fieldMetadataId: FIELD_METADATA_ID,
        direction: 'ASC',
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdViewSort = response.body.data.createViewSort;

    expect(createdViewSort).toHaveProperty('fieldMetadataId');
    expect(createdViewSort.fieldMetadataId).toEqual(FIELD_METADATA_ID);
    expect(createdViewSort).toHaveProperty('direction');
    expect(createdViewSort).toHaveProperty('id');
    expect(createdViewSort).toHaveProperty('createdAt');
    expect(createdViewSort).toHaveProperty('updatedAt');
    expect(createdViewSort).toHaveProperty('deletedAt');
    expect(createdViewSort).toHaveProperty('viewId');
  });

  it('2. should find many viewSorts', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.viewSorts;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const viewSorts = data.edges[0].node;

      expect(viewSorts).toHaveProperty('fieldMetadataId');
      expect(viewSorts).toHaveProperty('direction');
      expect(viewSorts).toHaveProperty('id');
      expect(viewSorts).toHaveProperty('createdAt');
      expect(viewSorts).toHaveProperty('updatedAt');
      expect(viewSorts).toHaveProperty('deletedAt');
      expect(viewSorts).toHaveProperty('viewId');
    }
  });

  it('2b. should find one viewSort', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_SORT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const viewSort = response.body.data.viewSort;

    expect(viewSort).toHaveProperty('fieldMetadataId');
    expect(viewSort).toHaveProperty('direction');
    expect(viewSort).toHaveProperty('id');
    expect(viewSort).toHaveProperty('createdAt');
    expect(viewSort).toHaveProperty('updatedAt');
    expect(viewSort).toHaveProperty('deletedAt');
    expect(viewSort).toHaveProperty('viewId');
  });

  it('3. should update many viewSorts', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      data: {
        direction: 'DESC',
      },
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewSorts = response.body.data.updateViewSorts;

    expect(updatedViewSorts).toHaveLength(2);

    updatedViewSorts.forEach((viewSort) => {
      expect(viewSort.direction).toEqual('DESC');
    });
  });

  it('3b. should update one viewSort', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      data: {
        direction: 'ASC',
      },
      recordId: VIEW_SORT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewSort = response.body.data.updateViewSort;

    expect(updatedViewSort.direction).toEqual('ASC');
  });

  it('4. should find many viewSorts with updated direction', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        direction: {
          eq: 'DESC',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSorts.edges).toHaveLength(2);
  });

  it('4b. should find one viewSort with updated direction', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        direction: {
          eq: 'ASC',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSort.direction).toEqual('ASC');
  });

  it('5. should delete many viewSorts', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedViewSorts = response.body.data.deleteViewSorts;

    expect(deletedViewSorts).toHaveLength(2);

    deletedViewSorts.forEach((viewSort) => {
      expect(viewSort.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one viewSort', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      recordId: VIEW_SORT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteViewSort.deletedAt).toBeTruthy();
  });

  it('6. should not find many viewSorts anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
      },
    });

    const findViewSortsResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findViewSortsResponse.body.data.viewSorts.edges).toHaveLength(0);
  });

  it('6b. should not find one viewSort anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_SORT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSort).toBeNull();
  });

  it('7. should find many deleted viewSorts with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSorts.edges).toHaveLength(2);
  });

  it('7b. should find one deleted viewSort with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_SORT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSort.id).toEqual(VIEW_SORT_3_ID);
  });

  it('8. should destroy many viewSorts', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyViewSorts).toHaveLength(2);
  });

  it('8b. should destroy one viewSort', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      recordId: VIEW_SORT_3_ID,
    });

    const destroyViewSortResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyViewSortResponse.body.data.destroyViewSort).toBeTruthy();
  });

  it('9. should not find many viewSorts anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewSort',
      objectMetadataPluralName: 'viewSorts',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_SORT_1_ID, VIEW_SORT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSorts.edges).toHaveLength(0);
  });

  it('9b. should not find one viewSort anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewSort',
      gqlFields: VIEW_SORT_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_SORT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewSort).toBeNull();
  });
});
