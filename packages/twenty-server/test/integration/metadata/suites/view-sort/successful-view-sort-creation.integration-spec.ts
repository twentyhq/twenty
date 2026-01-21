import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-core-view-sort.util';
import { destroyOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-core-view-sort.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('View Sort creation should succeed', () => {
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
        nameSingular: 'testViewSortCreationObject',
        namePlural: 'testViewSortCreationObjects',
        labelSingular: 'Test View Sort Creation Object',
        labelPlural: 'Test View Sort Creation Objects',
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
        name: 'testSortField',
        label: 'Test Sort Field',
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
        name: 'Test View For View Sort Creation',
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

  afterEach(async () => {
    if (createdViewSortId) {
      await destroyOneCoreViewSort({
        expectToFail: false,
        viewSortId: createdViewSortId,
      });
      createdViewSortId = '';
    }
  });

  it('should create a view sort with default direction (ASC)', async () => {
    const { data } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
      },
    });

    createdViewSortId = data?.createCoreViewSort?.id;

    expect(data.createCoreViewSort).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      fieldMetadataId: testFieldMetadataId,
      direction: ViewSortDirection.ASC,
    });
  });

  it('should create a view sort with ASC direction', async () => {
    const { data } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    createdViewSortId = data?.createCoreViewSort?.id;

    expect(data.createCoreViewSort).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      fieldMetadataId: testFieldMetadataId,
      direction: ViewSortDirection.ASC,
    });
  });

  it('should create a view sort with DESC direction', async () => {
    const { data } = await createOneCoreViewSort({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: testFieldMetadataId,
        direction: ViewSortDirection.DESC,
      },
    });

    createdViewSortId = data?.createCoreViewSort?.id;

    expect(data.createCoreViewSort).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      fieldMetadataId: testFieldMetadataId,
      direction: ViewSortDirection.DESC,
    });
  });
});
