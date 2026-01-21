import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-core-view-sort.util';
import { destroyOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-core-view-sort.util';
import { updateOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/update-one-core-view-sort.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Sort update should succeed', () => {
  let companyObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdViewId: string;
  let createdViewSortId: string;

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
        fieldsList: fields {
          edges {
            node {
              id
              name
            }
          }
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    const firstField = companyObjectMetadata.fieldsList.edges[0];

    jestExpectToBeDefined(firstField);
    testFieldMetadataId = firstField.node.id;

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For View Sort Update',
        objectMetadataId: companyObjectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createCoreView?.id;
    jestExpectToBeDefined(createdViewId);
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
    const { data } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    createdViewSortId = data?.createCoreViewSort?.id;
    jestExpectToBeDefined(createdViewSortId);
  });

  afterEach(async () => {
    if (createdViewSortId) {
      await destroyOneCoreViewSort({
        expectToFail: false,
        viewSortId: createdViewSortId,
      });
      createdViewSortId = '';
    }
  });

  it('should update direction from ASC to DESC', async () => {
    const { data } = await updateOneCoreViewSort({
      expectToFail: false,
      viewSortId: createdViewSortId,
      input: {
        direction: ViewSortDirection.DESC,
      },
    });

    expect(data.updateCoreViewSort).toMatchObject({
      id: createdViewSortId,
      direction: ViewSortDirection.DESC,
    });
  });

  it('should update direction from DESC to ASC', async () => {
    await updateOneCoreViewSort({
      expectToFail: false,
      viewSortId: createdViewSortId,
      input: {
        direction: ViewSortDirection.DESC,
      },
    });

    const { data } = await updateOneCoreViewSort({
      expectToFail: false,
      viewSortId: createdViewSortId,
      input: {
        direction: ViewSortDirection.ASC,
      },
    });

    expect(data.updateCoreViewSort).toMatchObject({
      id: createdViewSortId,
      direction: ViewSortDirection.ASC,
    });
  });
});
