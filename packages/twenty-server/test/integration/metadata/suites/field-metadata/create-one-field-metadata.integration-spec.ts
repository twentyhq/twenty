import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('createOne FieldMetadataService name/label sync', () => {
  let createdObjectMetadataId = '';

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestObject',
        namePlural: 'myTestObjects',
        labelSingular: 'My Test Object',
        labelPlural: 'My Test Objects',
        icon: 'Icon123',
      },
    });

    createdObjectMetadataId = objectMetadataId;
  });
  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });
  it('should create a field when name and label are synced correctly', async () => {
    // Arrange
    const FIELD_NAME = 'testField';
    const createFieldInput = {
      name: FIELD_NAME,
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isLabelSyncedWithName: true,
    };

    // Act
    const { data } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    // Assert
    expect(data.createOneField.name).toBe(FIELD_NAME);
  });

  it('should set isLabelSyncWithName to false if not in input', async () => {
    // Arrange
    const createFieldInput = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
    };

    // Act
    const { data } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
          `,
    });

    // Assert
    expect(data.createOneField.isLabelSyncedWithName).toBe(false);
  });

  it('should return an error when name and label are not synced but isLabelSyncedWithName is true', async () => {
    // Arrange
    const createFieldInput = {
      name: 'testField',
      label: 'Different Label',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isLabelSyncedWithName: true,
    };

    // Act
    const { errors } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
          `,
      expectToFail: true,
    });

    // Assert
    expect(errors[0].message).toBe(
      'Name is not synced with label. Expected name: "differentLabel", got testField',
    );
  });
});
