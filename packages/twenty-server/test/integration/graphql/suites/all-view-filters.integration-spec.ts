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

const VIEW_FILTER_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const VIEW_FILTER_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const VIEW_FILTER_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const FIELD_METADATA_ID = '20202020-0c28-43d8-8ba5-3659924d3489';

const VIEW_FILTER_FIELDS = `
  id
  fieldMetadataId
  operand
  value
  displayValue
  createdAt
  updatedAt
  deletedAt
  viewId
`;

describe('viewFilters resolvers (integration)', () => {
  it('1. should create and return viewFilters', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      data: [
        {
          id: VIEW_FILTER_1_ID,
          fieldMetadataId: FIELD_METADATA_ID,
        },
        {
          id: VIEW_FILTER_2_ID,
          fieldMetadataId: FIELD_METADATA_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createViewFilters).toHaveLength(2);

    response.body.data.createViewFilters.forEach((viewFilter) => {
      expect(viewFilter).toHaveProperty('fieldMetadataId');
      expect(viewFilter.fieldMetadataId).toEqual(FIELD_METADATA_ID);
      expect(viewFilter).toHaveProperty('id');
      expect(viewFilter).toHaveProperty('operand');
      expect(viewFilter).toHaveProperty('value');
      expect(viewFilter).toHaveProperty('displayValue');
      expect(viewFilter).toHaveProperty('createdAt');
      expect(viewFilter).toHaveProperty('updatedAt');
      expect(viewFilter).toHaveProperty('deletedAt');
      expect(viewFilter).toHaveProperty('viewId');
    });
  });

  it('1b. should create and return one viewFilter', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      data: {
        id: VIEW_FILTER_3_ID,
        fieldMetadataId: FIELD_METADATA_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdViewFilter = response.body.data.createViewFilter;

    expect(createdViewFilter).toHaveProperty('fieldMetadataId');
    expect(createdViewFilter.fieldMetadataId).toEqual(FIELD_METADATA_ID);
    expect(createdViewFilter).toHaveProperty('id');
    expect(createdViewFilter).toHaveProperty('operand');
    expect(createdViewFilter).toHaveProperty('value');
    expect(createdViewFilter).toHaveProperty('displayValue');
    expect(createdViewFilter).toHaveProperty('createdAt');
    expect(createdViewFilter).toHaveProperty('updatedAt');
    expect(createdViewFilter).toHaveProperty('deletedAt');
    expect(createdViewFilter).toHaveProperty('viewId');
  });

  it('2. should find many viewFilters', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.viewFilters;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const viewFilters = data.edges[0].node;

      expect(viewFilters).toHaveProperty('fieldMetadataId');
      expect(viewFilters).toHaveProperty('operand');
      expect(viewFilters).toHaveProperty('value');
      expect(viewFilters).toHaveProperty('displayValue');
      expect(viewFilters).toHaveProperty('id');
      expect(viewFilters).toHaveProperty('createdAt');
      expect(viewFilters).toHaveProperty('updatedAt');
      expect(viewFilters).toHaveProperty('deletedAt');
      expect(viewFilters).toHaveProperty('viewId');
    }
  });

  it('2b. should find one viewFilter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          eq: VIEW_FILTER_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const viewFilter = response.body.data.viewFilter;

    expect(viewFilter).toHaveProperty('fieldMetadataId');
    expect(viewFilter).toHaveProperty('operand');
    expect(viewFilter).toHaveProperty('value');
    expect(viewFilter).toHaveProperty('displayValue');
    expect(viewFilter).toHaveProperty('id');
    expect(viewFilter).toHaveProperty('createdAt');
    expect(viewFilter).toHaveProperty('updatedAt');
    expect(viewFilter).toHaveProperty('deletedAt');
    expect(viewFilter).toHaveProperty('viewId');
  });

  it('3. should update many viewFilters', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      data: {
        operand: 'Updated Operand',
      },
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewFilters = response.body.data.updateViewFilters;

    expect(updatedViewFilters).toHaveLength(2);

    updatedViewFilters.forEach((viewFilter) => {
      expect(viewFilter.operand).toEqual('Updated Operand');
    });
  });

  it('3b. should update one viewFilter', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      data: {
        operand: 'Updated Operand 3',
      },
      recordId: VIEW_FILTER_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewFilter = response.body.data.updateViewFilter;

    expect(updatedViewFilter.operand).toEqual('Updated Operand 3');
  });

  it('4. should find many viewFilters with updated operand', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        operand: {
          eq: 'Updated Operand',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilters.edges).toHaveLength(2);
  });

  it('4b. should find one viewFilter with updated operand', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        operand: {
          eq: 'Updated Operand 3',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilter.operand).toEqual('Updated Operand 3');
  });

  it('5. should delete many viewFilters', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedViewFilters = response.body.data.deleteViewFilters;

    expect(deletedViewFilters).toHaveLength(2);

    deletedViewFilters.forEach((viewFilter) => {
      expect(viewFilter.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one viewFilter', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      recordId: VIEW_FILTER_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteViewFilter.deletedAt).toBeTruthy();
  });

  it('6. should not find many viewFilters anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
      },
    });

    const findViewFiltersResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findViewFiltersResponse.body.data.viewFilters.edges).toHaveLength(0);
  });

  it('6b. should not find one viewFilter anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          eq: VIEW_FILTER_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilter).toBeNull();
  });

  it('7. should find many deleted viewFilters with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilters.edges).toHaveLength(2);
  });

  it('7b. should find one deleted viewFilter with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          eq: VIEW_FILTER_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilter.id).toEqual(VIEW_FILTER_3_ID);
  });

  it('8. should destroy many viewFilters', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyViewFilters).toHaveLength(2);
  });

  it('8b. should destroy one viewFilter', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      recordId: VIEW_FILTER_3_ID,
    });

    const destroyViewFilterResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyViewFilterResponse.body.data.destroyViewFilter).toBeTruthy();
  });

  it('9. should not find many viewFilters anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      objectMetadataPluralName: 'viewFilters',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          in: [VIEW_FILTER_1_ID, VIEW_FILTER_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilters.edges).toHaveLength(0);
  });

  it('9b. should not find one viewFilter anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewFilter',
      gqlFields: VIEW_FILTER_FIELDS,
      filter: {
        id: {
          eq: VIEW_FILTER_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFilter).toBeNull();
  });
});
