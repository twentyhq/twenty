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

const VIEW_FIELD_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const VIEW_FIELD_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const VIEW_FIELD_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const FIELD_METADATA_ID = '20202020-0c28-43d8-8ba5-3659924d3489';

const VIEW_FIELD_GQL_FIELDS = `
  id
  fieldMetadataId
  isVisible
  size
  position
  createdAt
  updatedAt
  deletedAt
  viewId
`;

describe('viewFields resolvers (integration)', () => {
  it('1. should create and return viewFields', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      data: [
        {
          id: VIEW_FIELD_1_ID,
          fieldMetadataId: FIELD_METADATA_ID,
        },
        {
          id: VIEW_FIELD_2_ID,
          fieldMetadataId: FIELD_METADATA_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createViewFields).toHaveLength(2);

    response.body.data.createViewFields.forEach((viewField) => {
      expect(viewField).toHaveProperty('fieldMetadataId');
      expect(viewField.fieldMetadataId).toEqual(FIELD_METADATA_ID);
      expect(viewField).toHaveProperty('id');
      expect(viewField).toHaveProperty('isVisible');
      expect(viewField).toHaveProperty('size');
      expect(viewField).toHaveProperty('position');
      expect(viewField).toHaveProperty('createdAt');
      expect(viewField).toHaveProperty('updatedAt');
      expect(viewField).toHaveProperty('deletedAt');
      expect(viewField).toHaveProperty('viewId');
    });
  });

  it('1b. should create and return one viewField', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      data: {
        id: VIEW_FIELD_3_ID,
        fieldMetadataId: FIELD_METADATA_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdViewField = response.body.data.createViewField;

    expect(createdViewField).toHaveProperty('fieldMetadataId');
    expect(createdViewField.fieldMetadataId).toEqual(FIELD_METADATA_ID);
    expect(createdViewField).toHaveProperty('id');
    expect(createdViewField).toHaveProperty('isVisible');
    expect(createdViewField).toHaveProperty('size');
    expect(createdViewField).toHaveProperty('position');
    expect(createdViewField).toHaveProperty('createdAt');
    expect(createdViewField).toHaveProperty('updatedAt');
    expect(createdViewField).toHaveProperty('deletedAt');
    expect(createdViewField).toHaveProperty('viewId');
  });

  it('2. should find many viewFields', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.viewFields;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const viewFields = data.edges[0].node;

      expect(viewFields).toHaveProperty('fieldMetadataId');
      expect(viewFields).toHaveProperty('isVisible');
      expect(viewFields).toHaveProperty('size');
      expect(viewFields).toHaveProperty('position');
      expect(viewFields).toHaveProperty('id');
      expect(viewFields).toHaveProperty('createdAt');
      expect(viewFields).toHaveProperty('updatedAt');
      expect(viewFields).toHaveProperty('deletedAt');
      expect(viewFields).toHaveProperty('viewId');
    }
  });

  it('2b. should find one viewField', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_FIELD_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const viewField = response.body.data.viewField;

    expect(viewField).toHaveProperty('fieldMetadataId');
    expect(viewField).toHaveProperty('isVisible');
    expect(viewField).toHaveProperty('size');
    expect(viewField).toHaveProperty('position');
    expect(viewField).toHaveProperty('id');
    expect(viewField).toHaveProperty('createdAt');
    expect(viewField).toHaveProperty('updatedAt');
    expect(viewField).toHaveProperty('deletedAt');
    expect(viewField).toHaveProperty('viewId');
  });

  it('3. should update many viewFields', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      data: {
        isVisible: false,
      },
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewFields = response.body.data.updateViewFields;

    expect(updatedViewFields).toHaveLength(2);

    updatedViewFields.forEach((viewField) => {
      expect(viewField.isVisible).toEqual(false);
    });
  });

  it('3b. should update one viewField', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      data: {
        isVisible: true,
      },
      recordId: VIEW_FIELD_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViewField = response.body.data.updateViewField;

    expect(updatedViewField.isVisible).toEqual(true);
  });

  it('4. should find many viewFields with updated visibility', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        isVisible: {
          eq: false,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFields.edges).toHaveLength(2);
  });

  it('4b. should find one viewField with updated visibility', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        isVisible: {
          eq: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewField.isVisible).toEqual(true);
  });

  it('5. should delete many viewFields', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedViewFields = response.body.data.deleteViewFields;

    expect(deletedViewFields).toHaveLength(2);

    deletedViewFields.forEach((viewField) => {
      expect(viewField.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one viewField', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      recordId: VIEW_FIELD_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteViewField.deletedAt).toBeTruthy();
  });

  it('6. should not find many viewFields anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
      },
    });

    const findViewFieldsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findViewFieldsResponse.body.data.viewFields.edges).toHaveLength(0);
  });

  it('6b. should not find one viewField anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_FIELD_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewField).toBeNull();
  });

  it('7. should find many deleted viewFields with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFields.edges).toHaveLength(2);
  });

  it('7b. should find one deleted viewField with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_FIELD_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewField.id).toEqual(VIEW_FIELD_3_ID);
  });

  it('8. should destroy many viewFields', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyViewFields).toHaveLength(2);
  });

  it('8b. should destroy one viewField', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      recordId: VIEW_FIELD_3_ID,
    });

    const destroyViewFieldResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyViewFieldResponse.body.data.destroyViewField).toBeTruthy();
  });

  it('9. should not find many viewFields anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'viewField',
      objectMetadataPluralName: 'viewFields',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_FIELD_1_ID, VIEW_FIELD_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewFields.edges).toHaveLength(0);
  });

  it('9b. should not find one viewField anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'viewField',
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_FIELD_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.viewField).toBeNull();
  });
});
