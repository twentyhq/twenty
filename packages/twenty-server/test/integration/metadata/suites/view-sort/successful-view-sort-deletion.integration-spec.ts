import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-core-view-sort.util';
import { deleteOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-core-view-sort.util';
import { destroyOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-core-view-sort.util';
import { findCoreViewSorts } from 'test/integration/metadata/suites/view-sort/utils/find-core-view-sorts.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Sort deletion should succeed', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdViewId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewSortDeletionObject',
        namePlural: 'testViewSortDeletionObjects',
        labelSingular: 'Test View Sort Deletion Object',
        labelPlural: 'Test View Sort Deletion Objects',
        icon: 'IconSort',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      input: {
        name: 'testSortDeletionField',
        label: 'Test Sort Deletion Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: 'id name label',
    });

    testFieldMetadataId = fieldMetadataId;

    const { data: viewData } = await createOneCoreView({
      expectToFail: false,
      input: {
        name: 'Test View For View Sort Deletion',
        objectMetadataId: testObjectMetadataId,
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

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
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

    expect(deleteData.deleteCoreViewSort).toMatchObject({
      id: viewSortId,
    });

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

    expect(destroyData.destroyCoreViewSort).toMatchObject({
      id: viewSortId,
    });
  });
});
