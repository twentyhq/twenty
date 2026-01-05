import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { updateOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/update-one-core-view-filter-group.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Filter Group update should succeed', () => {
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
        name: 'Test View For Filter Group Update',
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
      positionInViewFilterGroup: 5,
    });
  });
});
