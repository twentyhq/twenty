import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { assertViewStructure } from 'test/integration/utils/view-test.util';

import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

describe('Create core view', () => {
  let testObjectMetadataId: string;
  let testSelectFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myViewTestObject',
        namePlural: 'myViewTestObjects',
        labelSingular: 'My View Test Object',
        labelPlural: 'My View Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: {
          objectMetadataId,
        },
      });

    testSelectFieldMetadataId = selectFieldMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('should create a new view with all properties', async () => {
    const { data, errors } = await createOneCoreView({
      input: {
        name: 'Kanban View',
        objectMetadataId: testObjectMetadataId,
        icon: 'IconDeal',
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: testSelectFieldMetadataId,
        position: 1,
        isCompact: true,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    assertViewStructure(data.createCoreView, {
      name: 'Kanban View',
      objectMetadataId: testObjectMetadataId,
      mainGroupByFieldMetadataId: testSelectFieldMetadataId,
      type: ViewType.KANBAN,
      key: null,
      icon: 'IconDeal',
      position: 1,
      isCompact: true,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    });
  });

  it('should create a view with minimum required fields', async () => {
    const input = {
      name: 'Minimal View',
      objectMetadataId: testObjectMetadataId,
      icon: 'IconList',
    };

    const { data, errors } = await createOneCoreView({
      input,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    assertViewStructure(data.createCoreView, {
      name: input.name,
      objectMetadataId: input.objectMetadataId,
      icon: input.icon,
      type: ViewType.TABLE,
      mainGroupByFieldMetadataId: null,
      key: null,
      position: 0,
      isCompact: false,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    });
  });
});
