import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { updateOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

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

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Update Circular Dependency',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
    jestExpectToBeDefined(createdViewId);

    // Create a standalone view filter group for self-reference test
    const { data: filterGroupData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    viewFilterGroupId = filterGroupData?.createCoreViewFilterGroup?.id;
    jestExpectToBeDefined(viewFilterGroupId);

    // Create parent view filter group for chain test
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

    // Create child view filter group with parent reference for chain test
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

    if (viewFilterGroupId) {
      await destroyOneCoreViewFilterGroup({
        expectToFail: false,
        id: viewFilterGroupId,
      });
    }

    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it('when parentViewFilterGroupId equals id (self-reference)', async () => {
    const { errors } = await updateOneCoreViewFilterGroup({
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
    const { errors } = await updateOneCoreViewFilterGroup({
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
