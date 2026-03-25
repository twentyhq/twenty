import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createManyViewFields } from 'test/integration/metadata/suites/view-field/utils/create-many-view-fields.util';
import { deleteOneViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

describe('View Field Resolver - Successful Create Many Operations', () => {
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
        nameSingular: 'myFieldTestObject',
        namePlural: 'myFieldTestObjects',
        labelSingular: 'My Field Test Object',
        labelPlural: 'My Field Test Objects',
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
        createView: { id: testViewId },
      },
    } = await createOneView({
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
          data: { deleteViewField },
        } = await deleteOneViewField({
          expectToFail: false,
          input: {
            id: viewFieldId,
          },
        });

        expect(deleteViewField.deletedAt).not.toBeNull();
        await destroyOneViewField({
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
      data: { createManyViewFields: createdViewFields },
      errors,
    } = await createManyViewFields({
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
      data: { createManyViewFields: createdViewFields },
      errors,
    } = await createManyViewFields({
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
      data: { createManyViewFields: createdViewFields },
      errors,
    } = await createManyViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(0);
  });
});
