import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { deleteOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/delete-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { INTEGRATION_TEST_COMPANY_OBJECT_METADATA_ID } from 'test/integration/constants/integration-test-company-object-metadata-id.constants';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

describe('View Filter Group deletion should succeed', () => {
  let createdViewId: string;

  beforeAll(async () => {
    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Filter Group Deletion',
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

  it('should soft delete a view filter group', async () => {
    const { data: createData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    const createdViewFilterGroupId = createData?.createCoreViewFilterGroup?.id;

    const { data: deleteData } = await deleteOneCoreViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
    });

    expect(deleteData.deleteCoreViewFilterGroup).toBe(true);

    // Clean up by destroying
    await destroyOneCoreViewFilterGroup({
      expectToFail: false,
      id: createdViewFilterGroupId,
    });
  });

  it('should destroy a view filter group', async () => {
    const { data: createData } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      },
    });

    const createdViewFilterGroupId = createData?.createCoreViewFilterGroup?.id;

    const { data: destroyData } = await destroyOneCoreViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
    });

    expect(destroyData.destroyCoreViewFilterGroup).toBe(true);
  });
});

