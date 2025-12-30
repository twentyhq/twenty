import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { INTEGRATION_TEST_COMPANY_OBJECT_METADATA_ID } from 'test/integration/constants/integration-test-company-object-metadata-id.constants';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

describe('View Filter Group creation should succeed', () => {
  let createdViewId: string;
  let createdViewFilterGroupId: string;

  beforeAll(async () => {
    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Filter Group',
        objectMetadataId: INTEGRATION_TEST_COMPANY_OBJECT_METADATA_ID,
        type: 'table',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneCoreView({
        expectToFail: false,
        id: createdViewId,
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

    // Clean up parent
    await destroyOneCoreViewFilterGroup({
      expectToFail: false,
      id: parentViewFilterGroupId,
    });
  });
});

