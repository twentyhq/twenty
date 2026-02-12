import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { v4 } from 'uuid';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

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

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Creation Circular Dependency',
        objectMetadataId: companyObjectMetadata.id,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
    jestExpectToBeDefined(createdViewId);

    // Create parent view filter group for max depth test
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

    // Create child view filter group for max depth test
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

    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  it('when id equals parentViewFilterGroupId (self-reference)', async () => {
    const selfReferenceId = v4();

    const { errors } = await createOneCoreViewFilterGroup({
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
    const { errors } = await createOneCoreViewFilterGroup({
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
