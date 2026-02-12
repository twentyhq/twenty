import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Filter Group creation should succeed', () => {
  let companyObjectMetadataId: string;
  let createdViewId: string;
  let createdViewFilterGroupId: string;

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
    companyObjectMetadataId = companyObjectMetadata.id;

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Filter Group',
        objectMetadataId: companyObjectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  afterEach(async () => {
    if (createdViewFilterGroupId) {
      await destroyOneCoreViewFilterGroup({
        expectToFail: false,
        id: createdViewFilterGroupId,
      });
      createdViewFilterGroupId = '';
    }
  });

  it('should create a view filter group with minimal input', async () => {
    const { data } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
      },
    });

    createdViewFilterGroupId = data?.createCoreViewFilterGroup?.id;

    expect(data.createCoreViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      parentViewFilterGroupId: null,
    });
  });

  it('should create a view filter group with all fields', async () => {
    const { data } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        positionInViewFilterGroup: 1,
      },
    });

    createdViewFilterGroupId = data?.createCoreViewFilterGroup?.id;

    expect(data.createCoreViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      parentViewFilterGroupId: null,
    });
  });

  it('should create a nested view filter group', async () => {
    // Create parent filter group
    const { data: parentData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    const parentViewFilterGroupId = parentData?.createCoreViewFilterGroup?.id;

    // Create child filter group
    const { data: childData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        parentViewFilterGroupId,
      },
    });

    createdViewFilterGroupId = childData?.createCoreViewFilterGroup?.id;

    expect(childData.createCoreViewFilterGroup).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      parentViewFilterGroupId,
    });

    // Clean up parent (this CASCADE-deletes the child too)
    await destroyOneCoreViewFilterGroup({
      expectToFail: false,
      id: parentViewFilterGroupId,
    });

    // Clear the child ID since it was CASCADE-deleted with the parent
    createdViewFilterGroupId = '';
  });
});
