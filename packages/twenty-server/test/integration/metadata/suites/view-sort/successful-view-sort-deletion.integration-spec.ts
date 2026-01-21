import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-core-view-sort.util';
import { deleteOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-core-view-sort.util';
import { destroyOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-core-view-sort.util';
import { findCoreViewSorts } from 'test/integration/metadata/suites/view-sort/utils/find-core-view-sorts.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Sort deletion should succeed', () => {
  let companyObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdViewId: string;

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
        name: 'Test View For View Sort Deletion',
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

  it('should soft delete a view sort', async () => {
    const { data: createData } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    const viewSortId = createData?.createCoreViewSort?.id;
    jestExpectToBeDefined(viewSortId);

    const { data: deleteData } = await deleteOneCoreViewSort({
      expectToFail: false,
      viewSortId,
    });

    expect(deleteData.deleteCoreViewSort).toBe(true);

    const { data: findData } = await findCoreViewSorts({
      expectToFail: false,
      viewId: createdViewId,
    });

    const deletedViewSort = findData.getCoreViewSorts.find(
      (sort: { id: string }) => sort.id === viewSortId,
    );

    expect(deletedViewSort).toBeUndefined();

    await destroyOneCoreViewSort({
      expectToFail: false,
      viewSortId,
    });
  });

  it('should hard delete (destroy) a view sort', async () => {
    const { data: createData } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.DESC,
      },
    });

    const viewSortId = createData?.createCoreViewSort?.id;
    jestExpectToBeDefined(viewSortId);

    const { data: destroyData } = await destroyOneCoreViewSort({
      expectToFail: false,
      viewSortId,
    });

    expect(destroyData.destroyCoreViewSort).toBe(true);
  });
});
