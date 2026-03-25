import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { destroyOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-view-filter-group.util';
import { updateOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-view-filter-group.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterGroupLogicalOperator, ViewType } from 'twenty-shared/types';

describe('View Filter Group update should fail with circular dependency', () => {
  let createdViewId: string;
  let viewFilterGroupId: string;
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
        name: 'Test View For Update Circular Dependency',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);

    // Create a standalone view filter group for self-reference test
    const { data: filterGroupData } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    viewFilterGroupId = filterGroupData?.createViewFilterGroup?.id;
    jestExpectToBeDefined(viewFilterGroupId);

    // Create parent view filter group for chain test
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

    // Create child view filter group with parent reference for chain test
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
    // Delete child first (due to foreign key constraint)
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

    if (viewFilterGroupId) {
      await destroyOneViewFilterGroup({
        expectToFail: false,
        id: viewFilterGroupId,
      });
    }

    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it('when parentViewFilterGroupId equals id (self-reference)', async () => {
    const { errors } = await updateOneViewFilterGroup({
      id: viewFilterGroupId,
      expectToFail: true,
      input: {
        parentViewFilterGroupId: viewFilterGroupId,
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('when update creates a circular dependency chain', async () => {
    // Try to set parent's parent to be the child (parent → child, then child → parent = cycle)
    const { errors } = await updateOneViewFilterGroup({
      id: parentViewFilterGroupId,
      expectToFail: true,
      input: {
        parentViewFilterGroupId: childViewFilterGroupId,
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
