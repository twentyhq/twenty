import { createManyCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/create-many-core-view-fields.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { isDefined } from 'twenty-shared/utils';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

describe('View Field Resolver - Successful Create Many Operations - v2', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
    firstTestFieldMetadataId: string;
    secondTestFieldMetadataId: string;
    thirdTestFieldMetadataId: string;
  };
  let createdViewFieldIds: string[] = [];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFieldTestObjectV2',
        namePlural: 'myFieldTestObjectsV2',
        labelSingular: 'My Field Test Object v2',
        labelPlural: 'My Field Test Objects v2',
        icon: 'Icon123',
      },
    });

    const {
      data: {
        createOneField: { id: firstTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const {
      data: {
        createOneField: { id: secondTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'secondTestField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const {
      data: {
        createOneField: { id: thirdTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'thirdTestField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const {
      data: {
        createCoreView: { id: testViewId },
      },
    } = await createOneCoreView({
      input: {
        icon: 'icon123',
        objectMetadataId,
        name: 'TestViewForFields',
      },
      expectToFail: false,
    });

    testSetup = {
      testViewId,
      testObjectMetadataId: objectMetadataId,
      firstTestFieldMetadataId,
      secondTestFieldMetadataId,
      thirdTestFieldMetadataId,
    };
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: testSetup.testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.testObjectMetadataId },
    });
  });

  afterEach(async () => {
    for (const viewFieldId of createdViewFieldIds) {
      if (isDefined(viewFieldId)) {
        const {
          data: { deleteCoreViewField },
        } = await deleteOneCoreViewField({
          expectToFail: false,
          input: {
            id: viewFieldId,
          },
        });

        expect(deleteCoreViewField.deletedAt).not.toBeNull();
        await destroyOneCoreViewField({
          expectToFail: false,
          input: {
            id: viewFieldId,
          },
        });
      }
    }
    createdViewFieldIds = [];
  });

  it('should successfully create multiple view fields in batch', async () => {
    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: testSetup.firstTestFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: testSetup.secondTestFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: false,
        size: 200,
      },
      {
        fieldMetadataId: testSetup.thirdTestFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 2,
        isVisible: true,
        size: 180,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(3);

    // Verify each created view field
    createdViewFields.forEach((viewField, index) => {
      expect(viewField).toMatchObject({
        fieldMetadataId: inputs[index].fieldMetadataId,
        viewId: testSetup.testViewId,
        position: inputs[index].position,
        isVisible: inputs[index].isVisible,
        size: inputs[index].size,
      });

      createdViewFieldIds.push(viewField.id);
    });
  });

  it('should successfully create single view field using batch endpoint', async () => {
    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: testSetup.firstTestFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 5,
        isVisible: true,
        size: 250,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(1);

    const viewField = createdViewFields[0];

    expect(viewField).toMatchObject({
      fieldMetadataId: testSetup.firstTestFieldMetadataId,
      viewId: testSetup.testViewId,
      position: 5,
      isVisible: true,
      size: 250,
    });

    createdViewFieldIds.push(viewField.id);
  });

  it('should return empty array when creating zero view fields', async () => {
    const inputs: CreateViewFieldInput[] = [];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(0);
  });
});
