import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { destroyOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-view-filter-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterGroupLogicalOperator, ViewType } from 'twenty-shared/types';
import { v4 } from 'uuid';

describe('View Filter Group creation should fail with circular dependency', () => {
  let createdViewId: string;
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

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Creation Circular Dependency',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);

    // Create parent view filter group for max depth test
    const { data: parentFilterGroupData } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    parentViewFilterGroupId =
      parentFilterGroupData?.createViewFilterGroup?.id;
    jestExpectToBeDefined(parentViewFilterGroupId);

    // Create child view filter group for max depth test
    const { data: childFilterGroupData } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: parentViewFilterGroupId,
      },
    });

    childViewFilterGroupId =
      childFilterGroupData?.createViewFilterGroup?.id;
    jestExpectToBeDefined(childViewFilterGroupId);
  });

  afterAll(async () => {
    if (childViewFilterGroupId) {
      await destroyOneViewFilterGroup({
        expectToFail: false,
        id: childViewFilterGroupId,
      });
    }

    if (parentViewFilterGroupId) {
      await destroyOneViewFilterGroup({
        expectToFail: false,
        id: parentViewFilterGroupId,
      });
    }

    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it('when id equals parentViewFilterGroupId (self-reference)', async () => {
    const selfReferenceId = v4();

    const { errors } = await createOneViewFilterGroup({
      expectToFail: true,
      input: {
        id: selfReferenceId,
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: selfReferenceId,
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('when max depth is exceeded during creation', async () => {
    // Trying to create a grandchild (depth 3) when max depth is 2
    const { errors } = await createOneViewFilterGroup({
      expectToFail: true,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        parentViewFilterGroupId: childViewFilterGroupId,
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
