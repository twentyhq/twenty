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

const VIEW_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const VIEW_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const VIEW_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const OBJECT_METADATA_ID = '20202020-b374-4779-a561-80086cb2e17f';

const VIEW_GQL_FIELDS = `
  id
  name
  objectMetadataId
  type
  key
  icon
  kanbanFieldMetadataId
  position
  isCompact
  createdAt
  updatedAt
  deletedAt
`;

describe('views resolvers (integration)', () => {
  it('1. should create and return views', async () => {
    const viewName1 = generateRecordName(VIEW_1_ID);
    const viewName2 = generateRecordName(VIEW_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      data: [
        {
          id: VIEW_1_ID,
          name: viewName1,
          objectMetadataId: OBJECT_METADATA_ID,
        },
        {
          id: VIEW_2_ID,
          name: viewName2,
          objectMetadataId: OBJECT_METADATA_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createViews).toHaveLength(2);

    response.body.data.createViews.forEach((view) => {
      expect(view).toHaveProperty('name');
      expect([viewName1, viewName2]).toContain(view.name);
      expect(view).toHaveProperty('id');
      expect(view).toHaveProperty('objectMetadataId');
      expect(view).toHaveProperty('type');
      expect(view).toHaveProperty('key');
      expect(view).toHaveProperty('icon');
      expect(view).toHaveProperty('kanbanFieldMetadataId');
      expect(view).toHaveProperty('position');
      expect(view).toHaveProperty('isCompact');
      expect(view).toHaveProperty('createdAt');
      expect(view).toHaveProperty('updatedAt');
      expect(view).toHaveProperty('deletedAt');
    });
  });

  it('1b. should create and return one view', async () => {
    const viewName = generateRecordName(VIEW_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      data: {
        id: VIEW_3_ID,
        name: viewName,
        objectMetadataId: OBJECT_METADATA_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdView = response.body.data.createView;

    expect(createdView).toHaveProperty('name');
    expect(createdView.name).toEqual(viewName);
    expect(createdView).toHaveProperty('id');
    expect(createdView).toHaveProperty('objectMetadataId');
    expect(createdView).toHaveProperty('type');
    expect(createdView).toHaveProperty('key');
    expect(createdView).toHaveProperty('icon');
    expect(createdView).toHaveProperty('kanbanFieldMetadataId');
    expect(createdView).toHaveProperty('position');
    expect(createdView).toHaveProperty('isCompact');
    expect(createdView).toHaveProperty('createdAt');
    expect(createdView).toHaveProperty('updatedAt');
    expect(createdView).toHaveProperty('deletedAt');
  });

  it('2. should find many views', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.views;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const views = data.edges[0].node;

      expect(views).toHaveProperty('name');
      expect(views).toHaveProperty('objectMetadataId');
      expect(views).toHaveProperty('type');
      expect(views).toHaveProperty('key');
      expect(views).toHaveProperty('icon');
      expect(views).toHaveProperty('kanbanFieldMetadataId');
      expect(views).toHaveProperty('position');
      expect(views).toHaveProperty('isCompact');
      expect(views).toHaveProperty('id');
      expect(views).toHaveProperty('createdAt');
      expect(views).toHaveProperty('updatedAt');
      expect(views).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one view', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const view = response.body.data.view;

    expect(view).toHaveProperty('name');
    expect(view).toHaveProperty('objectMetadataId');
    expect(view).toHaveProperty('type');
    expect(view).toHaveProperty('key');
    expect(view).toHaveProperty('icon');
    expect(view).toHaveProperty('kanbanFieldMetadataId');
    expect(view).toHaveProperty('position');
    expect(view).toHaveProperty('isCompact');
    expect(view).toHaveProperty('id');
    expect(view).toHaveProperty('createdAt');
    expect(view).toHaveProperty('updatedAt');
    expect(view).toHaveProperty('deletedAt');
  });

  it('3. should update many views', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      data: {
        isCompact: true,
      },
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedViews = response.body.data.updateViews;

    expect(updatedViews).toHaveLength(2);

    updatedViews.forEach((view) => {
      expect(view.isCompact).toEqual(true);
    });
  });

  it('3b. should update one view', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      data: {
        isCompact: false,
      },
      recordId: VIEW_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedView = response.body.data.updateView;

    expect(updatedView.isCompact).toEqual(false);
  });

  it('4. should find many views with updated isCompact', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        isCompact: {
          eq: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.views.edges).toHaveLength(2);
  });

  it('4b. should find one view with updated isCompact', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        isCompact: {
          eq: false,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.view.isCompact).toEqual(false);
  });

  it('5. should delete many views', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedViews = response.body.data.deleteViews;

    expect(deletedViews).toHaveLength(2);

    deletedViews.forEach((view) => {
      expect(view.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one view', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      recordId: VIEW_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteView.deletedAt).toBeTruthy();
  });

  it('6. should not find many views anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
      },
    });

    const findViewsResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findViewsResponse.body.data.views.edges).toHaveLength(0);
  });

  it('6b. should not find one view anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.view).toBeNull();
  });

  it('7. should find many deleted views with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.views.edges).toHaveLength(2);
  });

  it('7b. should find one deleted view with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.view.id).toEqual(VIEW_3_ID);
  });

  it('8. should destroy many views', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyViews).toHaveLength(2);
  });

  it('8b. should destroy one view', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      recordId: VIEW_3_ID,
    });

    const destroyViewResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyViewResponse.body.data.destroyView).toBeTruthy();
  });

  it('9. should not find many views anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'view',
      objectMetadataPluralName: 'views',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          in: [VIEW_1_ID, VIEW_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.views.edges).toHaveLength(0);
  });

  it('9b. should not find one view anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'view',
      gqlFields: VIEW_GQL_FIELDS,
      filter: {
        id: {
          eq: VIEW_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.view).toBeNull();
  });
});
