import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { destroyOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-view-sort.util';
import { updateOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/update-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { ViewSortDirection } from 'twenty-shared/types';

describe('View Sort update should succeed', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let createdViewId: string;
  let createdViewSortId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewSortUpdateObject',
        namePlural: 'testViewSortUpdateObjects',
        labelSingular: 'Test View Sort Update Object',
        labelPlural: 'Test View Sort Update Objects',
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
        name: 'testSortUpdateField',
        label: 'Test Sort Update Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: 'id name label',
    });

    testFieldMetadataId = fieldMetadataId;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For View Sort Update',
        objectMetadataId: testObjectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconBuildingSkyscraper',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({
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

  beforeEach(async () => {
    const { data } = await createOneViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    createdViewSortId = data?.createViewSort?.id;
    jestExpectToBeDefined(createdViewSortId);
  });

  afterEach(async () => {
    if (createdViewSortId) {
      await destroyOneViewSort({
        expectToFail: false,
        input: { id: createdViewSortId },
      });
      createdViewSortId = '';
    }
  });

  it('should update direction from ASC to DESC', async () => {
    const { data } = await updateOneViewSort({
      expectToFail: false,
      input: {
        id: createdViewSortId,
        update: {
          direction: ViewSortDirection.DESC,
        },
      },
    });

    expect(data.updateViewSort).toMatchObject({
      id: createdViewSortId,
      direction: ViewSortDirection.DESC,
    });
  });

  it('should update direction from DESC to ASC', async () => {
    await updateOneViewSort({
      expectToFail: false,
      input: {
        id: createdViewSortId,
        update: {
          direction: ViewSortDirection.DESC,
        },
      },
    });

    const { data } = await updateOneViewSort({
      expectToFail: false,
      input: {
        id: createdViewSortId,
        update: {
          direction: ViewSortDirection.ASC,
        },
      },
    });

    expect(data.updateViewSort).toMatchObject({
      id: createdViewSortId,
      direction: ViewSortDirection.ASC,
    });
  });
});
