import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { updateOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

type TestContext = {
  id: string;
  input: UpdateViewFilterGroupInput;
};

const failingViewFilterGroupUpdateTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when view filter group id does not exist',
      context: {
        id: v4(),
        input: {
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
        },
      },
    },
    {
      title: 'when parentViewFilterGroupId does not exist',
      context: {
        id: 'USE_CREATED_ID',
        input: {
          parentViewFilterGroupId: v4(),
        },
      },
    },
    {
      title: 'when parentViewFilterGroupId equals id (self-reference)',
      context: {
        id: 'USE_CREATED_ID',
        input: {
          parentViewFilterGroupId: 'USE_CREATED_ID',
        },
      },
    },
    {
      title: 'when update creates a circular dependency chain',
      context: {
        id: 'USE_PARENT_ID',
        input: {
          parentViewFilterGroupId: 'USE_CHILD_ID',
        },
      },
    },
  ];

describe('View Filter Group update should fail', () => {
  let createdViewId: string;
  let createdViewFilterGroupId: string;
  // For circular dependency chain test: parent → child
  let parentViewFilterGroupId: string;
  let childViewFilterGroupId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Failing Filter Group Update',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
    jestExpectToBeDefined(createdViewId);

    const { data: filterGroupData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    createdViewFilterGroupId = filterGroupData?.createCoreViewFilterGroup?.id;
    jestExpectToBeDefined(createdViewFilterGroupId);

    // Create parent view filter group
    const { data: parentFilterGroupData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    parentViewFilterGroupId =
      parentFilterGroupData?.createCoreViewFilterGroup?.id;
    jestExpectToBeDefined(parentViewFilterGroupId);

    // Create child view filter group with parent reference
    const { data: childFilterGroupData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: parentViewFilterGroupId,
      },
    });

    childViewFilterGroupId =
      childFilterGroupData?.createCoreViewFilterGroup?.id;
    jestExpectToBeDefined(childViewFilterGroupId);
  });

  afterAll(async () => {
    // Delete child first (due to foreign key constraint)
    if (childViewFilterGroupId) {
      await destroyOneCoreViewFilterGroup({
        expectToFail: false,
        id: childViewFilterGroupId,
      });
    }

    if (parentViewFilterGroupId) {
      await destroyOneCoreViewFilterGroup({
        expectToFail: false,
        id: parentViewFilterGroupId,
      });
    }

    if (createdViewFilterGroupId) {
      await destroyOneCoreViewFilterGroup({
        expectToFail: false,
        id: createdViewFilterGroupId,
      });
    }

    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it.each(eachTestingContextFilter(failingViewFilterGroupUpdateTestCases))(
    '$title',
    async ({ context }) => {
      let id: string;

      switch (context.id) {
        case 'USE_CREATED_ID':
          id = createdViewFilterGroupId;
          break;
        case 'USE_PARENT_ID':
          id = parentViewFilterGroupId;
          break;
        case 'USE_CHILD_ID':
          id = childViewFilterGroupId;
          break;
        default:
          id = context.id;
      }

      let parentId: string | undefined;

      if (
        typeof context.input.parentViewFilterGroupId === 'string' &&
        context.input.parentViewFilterGroupId === 'USE_CREATED_ID'
      ) {
        parentId = createdViewFilterGroupId;
      } else if (
        typeof context.input.parentViewFilterGroupId === 'string' &&
        context.input.parentViewFilterGroupId === 'USE_CHILD_ID'
      ) {
        parentId = childViewFilterGroupId;
      } else {
        parentId = context.input.parentViewFilterGroupId;
      }

      const { errors } = await updateOneCoreViewFilterGroup({
        id,
        expectToFail: true,
        input: {
          ...context.input,
          parentViewFilterGroupId: parentId,
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
