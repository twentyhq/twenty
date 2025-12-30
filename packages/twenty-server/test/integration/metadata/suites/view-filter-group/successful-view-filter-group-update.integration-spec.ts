import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { updateOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { INTEGRATION_TEST_COMPANY_OBJECT_METADATA_ID } from 'test/integration/constants/integration-test-company-object-metadata-id.constants';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

describe('View Filter Group update should succeed', () => {
  let createdViewId: string;
  let createdViewFilterGroupId: string;

  beforeAll(async () => {
    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For Filter Group Update',
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

  beforeEach(async () => {
    const { data } = await createOneCoreViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    createdViewFilterGroupId = data?.createCoreViewFilterGroup?.id;
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

  it('should update the logical operator', async () => {
    const { data } = await updateOneCoreViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
      input: {
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      },
    });

    expect(data.updateCoreViewFilterGroup).toMatchObject({
      id: createdViewFilterGroupId,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
    });
  });

  it('should update the position', async () => {
    const { data } = await updateOneCoreViewFilterGroup({
      id: createdViewFilterGroupId,
      expectToFail: false,
      input: {
        positionInViewFilterGroup: 5,
      },
    });

    expect(data.updateCoreViewFilterGroup).toMatchObject({
      id: createdViewFilterGroupId,
    });
  });
});

