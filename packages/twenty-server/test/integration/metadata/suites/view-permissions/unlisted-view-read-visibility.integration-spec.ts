import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createViewFieldGroupQueryFactory } from 'test/integration/metadata/suites/view-field-group/utils/create-view-field-group-query-factory.util';
import { createViewFieldQueryFactory } from 'test/integration/metadata/suites/view-field/utils/create-view-field-query-factory.util';
import { createViewFilterGroupQueryFactory } from 'test/integration/metadata/suites/view-filter-group/utils/create-view-filter-group-query-factory.util';
import { createViewFilterQueryFactory } from 'test/integration/metadata/suites/view-filter/utils/create-view-filter-query-factory.util';
import { createViewSortQueryFactory } from 'test/integration/metadata/suites/view-sort/utils/create-view-sort-query-factory.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { destroyViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-view-query-factory.util';
import { updateViewQueryFactory } from 'test/integration/metadata/suites/view/utils/update-view-query-factory.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const VIEW_CHILD_READS = [
  {
    childName: 'view field',
    listQueryName: 'getViewFields',
    oneQueryName: 'getViewField',
  },
  {
    childName: 'view filter',
    listQueryName: 'getViewFilters',
    oneQueryName: 'getViewFilter',
  },
  {
    childName: 'view sort',
    listQueryName: 'getViewSorts',
    oneQueryName: 'getViewSort',
  },
  {
    childName: 'view group',
    listQueryName: 'getViewGroups',
    oneQueryName: 'getViewGroup',
  },
  {
    childName: 'view filter group',
    listQueryName: 'getViewFilterGroups',
    oneQueryName: 'getViewFilterGroup',
  },
  {
    childName: 'view field group',
    listQueryName: 'getViewFieldGroups',
    oneQueryName: 'getViewFieldGroup',
  },
];

const VIEW_CHILD_LIST_ALL_READS = [
  { childName: 'view filter', listQueryName: 'getViewFilters' },
  { childName: 'view sort', listQueryName: 'getViewSorts' },
  { childName: 'view group', listQueryName: 'getViewGroups' },
  { childName: 'view filter group', listQueryName: 'getViewFilterGroups' },
];

const VIEW_CHILD_REST_READS = [
  { childName: 'view field', restPath: 'viewFields' },
  { childName: 'view filter', restPath: 'viewFilters' },
  { childName: 'view sort', restPath: 'viewSorts' },
  { childName: 'view group', restPath: 'viewGroups' },
  { childName: 'view filter group', restPath: 'viewFilterGroups' },
];

const VIEW_WITH_CHILDREN_GQL_FIELDS = `
  id
  viewFields { id }
  viewFilters { id }
  viewSorts { id }
  viewGroups { id }
  viewFilterGroups { id }
  viewFieldGroups { id }
`;

const CHILD_RELATION_NAMES = [
  'viewFields',
  'viewFilters',
  'viewSorts',
  'viewGroups',
  'viewFilterGroups',
  'viewFieldGroups',
];

const getNonCreatorCallers = () => [
  { caller: 'a member holding VIEWS', token: APPLE_JONY_MEMBER_ACCESS_TOKEN },
  { caller: 'an admin', token: APPLE_JANE_ADMIN_ACCESS_TOKEN },
  { caller: 'an API key', token: API_KEY_ACCESS_TOKEN },
];

const findViewById = async ({
  viewId,
  token,
  gqlFields = 'id',
}: {
  viewId: string;
  token: string;
  gqlFields?: string;
}) => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query GetView($id: String!) {
          getView(id: $id) {
            ${gqlFields}
          }
        }
      `,
      variables: { id: viewId },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.getView;
};

const findViewIds = async (token: string): Promise<string[]> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query GetViews {
          getViews {
            id
          }
        }
      `,
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.getViews.map(({ id }: { id: string }) => id);
};

const findChildIds = async ({
  listQueryName,
  viewId,
  token,
}: {
  listQueryName: string;
  viewId?: string;
  token: string;
}): Promise<string[]> => {
  const response = await makeMetadataApiRequest(
    !isDefined(viewId)
      ? {
          query: gql`
            query FindAllViewChildren {
              ${listQueryName} {
                id
              }
            }
          `,
        }
      : {
          query: gql`
            query FindViewChildren($viewId: String!) {
              ${listQueryName}(viewId: $viewId) {
                id
              }
            }
          `,
          variables: { viewId },
        },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[listQueryName].map(({ id }: { id: string }) => id);
};

const findChildById = async ({
  oneQueryName,
  childId,
  token,
}: {
  oneQueryName: string;
  childId: string;
  token: string;
}) => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query FindViewChild($id: String!) {
          ${oneQueryName}(id: $id) {
            id
          }
        }
      `,
      variables: { id: childId },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[oneQueryName];
};

const readViewOwnership = async (
  viewId: string,
): Promise<{ visibility: string; createdByUserWorkspaceId: string | null }> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT visibility, "createdByUserWorkspaceId" FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view;
};

describe('unlisted view read visibility (integration)', () => {
  let opportunityObjectMetadataId: string;
  let unlistedViewId: string;
  const childIdByChildName: Record<string, string> = {};

  const createChildAsCreator = async ({
    operation,
    mutationName,
  }: {
    operation: Parameters<typeof makeMetadataApiRequest>[0];
    mutationName: string;
  }): Promise<string> => {
    const response = await makeMetadataApiRequest(
      operation,
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[mutationName].id;
  };

  beforeAll(async () => {
    opportunityObjectMetadataId =
      await findObjectMetadataIdByName('opportunity');

    const [
      nameFieldMetadataId,
      stageFieldMetadataId,
      closeDateFieldMetadataId,
    ] = await Promise.all(
      ['name', 'stage', 'closeDate'].map((fieldName) =>
        findFieldMetadataIdByName({
          objectMetadataId: opportunityObjectMetadataId,
          fieldName,
        }),
      ),
    );

    const createViewResponse = await makeMetadataApiRequest(
      createViewQueryFactory({
        gqlFields: 'id',
        input: {
          name: 'Guest private opportunities',
          objectMetadataId: opportunityObjectMetadataId,
          icon: 'IconTable',
          type: ViewType.TABLE,
          visibility: ViewVisibility.UNLISTED,
          mainGroupByFieldMetadataId: stageFieldMetadataId,
        },
      }),
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(createViewResponse.body.errors).toBeUndefined();
    unlistedViewId = createViewResponse.body.data.createView.id;

    childIdByChildName['view field'] = await createChildAsCreator({
      operation: createViewFieldQueryFactory({
        gqlFields: 'id',
        input: {
          viewId: unlistedViewId,
          fieldMetadataId: closeDateFieldMetadataId,
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
      mutationName: 'createViewField',
    });

    childIdByChildName['view filter group'] = await createChildAsCreator({
      operation: createViewFilterGroupQueryFactory({
        gqlFields: 'id',
        input: {
          viewId: unlistedViewId,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
          positionInViewFilterGroup: 0,
        },
      }),
      mutationName: 'createViewFilterGroup',
    });

    childIdByChildName['view filter'] = await createChildAsCreator({
      operation: createViewFilterQueryFactory({
        gqlFields: 'id',
        input: {
          viewId: unlistedViewId,
          viewFilterGroupId: childIdByChildName['view filter group'],
          fieldMetadataId: nameFieldMetadataId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'private',
          positionInViewFilterGroup: 0,
        },
      }),
      mutationName: 'createViewFilter',
    });

    childIdByChildName['view sort'] = await createChildAsCreator({
      operation: createViewSortQueryFactory({
        gqlFields: 'id',
        input: {
          viewId: unlistedViewId,
          fieldMetadataId: nameFieldMetadataId,
          direction: ViewSortDirection.ASC,
        },
      }),
      mutationName: 'createViewSort',
    });

    childIdByChildName['view field group'] = await createChildAsCreator({
      operation: createViewFieldGroupQueryFactory({
        gqlFields: 'id',
        input: {
          viewId: unlistedViewId,
          name: 'Private group',
          position: 1,
          isVisible: true,
        },
      }),
      mutationName: 'createViewFieldGroup',
    });

    const [firstViewGroupId] = await findChildIds({
      listQueryName: 'getViewGroups',
      viewId: unlistedViewId,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });

    jestExpectToBeDefined(firstViewGroupId);
    childIdByChildName['view group'] = firstViewGroupId;
  });

  afterAll(async () => {
    await makeMetadataApiRequest(
      destroyViewQueryFactory({ viewId: unlistedViewId }),
    );
  });

  describe('view', () => {
    it('should return the view to its creator through GraphQL and REST', async () => {
      expect(
        await findViewById({
          viewId: unlistedViewId,
          token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        }),
      ).toEqual({ id: unlistedViewId });
      expect(await findViewIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toContain(
        unlistedViewId,
      );

      const restResponse = await makeRestApiRequest({
        method: 'get',
        path: `/metadata/views/${unlistedViewId}`,
        bearer: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      });

      expect(restResponse.status).toBe(200);
      expect(restResponse.body.id).toBe(unlistedViewId);
    });

    it.each(getNonCreatorCallers())(
      'should behave as a missing view for $caller',
      async ({ token }) => {
        expect(
          await findViewById({ viewId: unlistedViewId, token }),
        ).toBeNull();
        expect(await findViewIds(token)).not.toContain(unlistedViewId);

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/views/${unlistedViewId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
      },
    );
  });

  describe.each(VIEW_CHILD_READS)(
    '$childName',
    ({ childName, listQueryName, oneQueryName }) => {
      it('should return the child to the view creator', async () => {
        const childId = childIdByChildName[childName];

        expect(
          await findChildIds({
            listQueryName,
            viewId: unlistedViewId,
            token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          }),
        ).toContain(childId);
        expect(
          await findChildById({
            oneQueryName,
            childId,
            token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          }),
        ).toEqual({ id: childId });
      });

      it.each(getNonCreatorCallers())(
        'should behave as a missing child for $caller',
        async ({ token }) => {
          const childId = childIdByChildName[childName];

          expect(
            await findChildIds({
              listQueryName,
              viewId: unlistedViewId,
              token,
            }),
          ).toEqual([]);
          expect(
            await findChildById({ oneQueryName, childId, token }),
          ).toBeNull();
        },
      );
    },
  );

  describe.each(VIEW_CHILD_LIST_ALL_READS)(
    '$childName listed without a view',
    ({ childName, listQueryName }) => {
      it('should include the child for the view creator', async () => {
        expect(
          await findChildIds({
            listQueryName,
            token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
          }),
        ).toContain(childIdByChildName[childName]);
      });

      it.each(getNonCreatorCallers())(
        'should leave the child out for $caller',
        async ({ token }) => {
          expect(await findChildIds({ listQueryName, token })).not.toContain(
            childIdByChildName[childName],
          );
        },
      );
    },
  );

  describe.each(VIEW_CHILD_REST_READS)(
    '$childName through REST',
    ({ childName, restPath }) => {
      it('should return the child to the view creator', async () => {
        const childId = childIdByChildName[childName];

        const restListResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/${restPath}?viewId=${unlistedViewId}`,
          bearer: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        });

        expect(restListResponse.status).toBe(200);
        expect(
          restListResponse.body.data.map(({ id }: { id: string }) => id),
        ).toContain(childId);

        const restOneResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/${restPath}/${childId}`,
          bearer: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        });

        expect(restOneResponse.status).toBe(200);
        expect(restOneResponse.body.id).toBe(childId);
      });

      it.each(getNonCreatorCallers())(
        'should behave as a missing child for $caller',
        async ({ token }) => {
          const restListResponse = await makeRestApiRequest({
            method: 'get',
            path: `/metadata/${restPath}?viewId=${unlistedViewId}`,
            bearer: token,
          });

          expect(restListResponse.status).toBe(200);
          expect(restListResponse.body.data).toEqual([]);
          expect(restListResponse.body.totalCount).toBe(0);

          const restOneResponse = await makeRestApiRequest({
            method: 'get',
            path: `/metadata/${restPath}/${childIdByChildName[childName]}`,
            bearer: token,
          });

          expect(restOneResponse.status).toBe(404);
        },
      );
    },
  );

  describe('children resolved from a view', () => {
    it('should resolve every child for the creator', async () => {
      const view = await findViewById({
        viewId: unlistedViewId,
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        gqlFields: VIEW_WITH_CHILDREN_GQL_FIELDS,
      });

      for (const relationName of CHILD_RELATION_NAMES) {
        expect(view[relationName]).not.toEqual([]);
      }
    });

    it('should resolve no child on the mutation response of a non-creator holding VIEWS', async () => {
      const response = await makeMetadataApiRequest(
        updateViewQueryFactory({
          viewId: unlistedViewId,
          gqlFields: VIEW_WITH_CHILDREN_GQL_FIELDS,
          input: { id: unlistedViewId, icon: 'IconList' },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();

      for (const relationName of CHILD_RELATION_NAMES) {
        expect(response.body.data.updateView[relationName]).toEqual([]);
      }
    });
  });

  describe('unlisted view without a creator', () => {
    let ownerlessViewId: string;
    let ownerlessViewFilterGroupId: string;

    beforeAll(async () => {
      const createViewResponse = await makeMetadataApiRequest(
        createViewQueryFactory({
          gqlFields: 'id',
          input: {
            name: 'Ownerless opportunities',
            objectMetadataId: opportunityObjectMetadataId,
            icon: 'IconTable',
            type: ViewType.TABLE,
            visibility: ViewVisibility.WORKSPACE,
          },
        }),
        API_KEY_ACCESS_TOKEN,
      );

      expect(createViewResponse.body.errors).toBeUndefined();
      ownerlessViewId = createViewResponse.body.data.createView.id;

      const createViewFilterGroupResponse = await makeMetadataApiRequest(
        createViewFilterGroupQueryFactory({
          gqlFields: 'id',
          input: {
            viewId: ownerlessViewId,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
            positionInViewFilterGroup: 0,
          },
        }),
        API_KEY_ACCESS_TOKEN,
      );

      expect(createViewFilterGroupResponse.body.errors).toBeUndefined();
      ownerlessViewFilterGroupId =
        createViewFilterGroupResponse.body.data.createViewFilterGroup.id;

      const updateViewResponse = await makeMetadataApiRequest(
        updateViewQueryFactory({
          viewId: ownerlessViewId,
          gqlFields: 'id',
          input: { id: ownerlessViewId, visibility: ViewVisibility.UNLISTED },
        }),
        API_KEY_ACCESS_TOKEN,
      );

      expect(updateViewResponse.body.errors).toBeUndefined();
      expect(await readViewOwnership(ownerlessViewId)).toEqual({
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: null,
      });
    });

    afterAll(async () => {
      await makeMetadataApiRequest(
        destroyViewQueryFactory({ viewId: ownerlessViewId }),
      );
    });

    it.each([
      { caller: 'a guest', token: APPLE_PHIL_GUEST_ACCESS_TOKEN },
      ...getNonCreatorCallers(),
    ])(
      'should hide the view and its children from $caller',
      async ({ token }) => {
        expect(
          await findViewById({ viewId: ownerlessViewId, token }),
        ).toBeNull();
        expect(await findViewIds(token)).not.toContain(ownerlessViewId);
        expect(
          await findChildIds({
            listQueryName: 'getViewFilterGroups',
            viewId: ownerlessViewId,
            token,
          }),
        ).toEqual([]);
        expect(
          await findChildById({
            oneQueryName: 'getViewFilterGroup',
            childId: ownerlessViewFilterGroupId,
            token,
          }),
        ).toBeNull();

        const restResponse = await makeRestApiRequest({
          method: 'get',
          path: `/metadata/views/${ownerlessViewId}`,
          bearer: token,
        });

        expect(restResponse.status).toBe(404);
      },
    );
  });
});
