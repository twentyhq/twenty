import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('update one unique field metadata', () => {
  let createdObjectMetadataId = '';

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testObject',
        namePlural: 'testObjects',
        labelSingular: 'Test Object',
        labelPlural: 'Test Objects',
        icon: 'IconTest',
      },
    });

    createdObjectMetadataId = objectMetadataId;
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('should update non unique field metadata to unique', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: true },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.updateOneField).toBeDefined();
    expect(data.updateOneField.isUnique).toBe(true);
  });

  it('should update unique field metadata to non unique', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'uniqueTestField',
        label: 'Unique Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: false },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.updateOneField).toBeDefined();
    expect(data.updateOneField.isUnique).toBe(false);
  });

  it('should update unique index name if field metadata name is updated', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'uniqueTestField',
        label: 'Unique Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: {
          name: 'renamedUniqueField',
          label: 'Renamed Unique Field',
        },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.updateOneField).toBeDefined();
    expect(data.updateOneField.name).toBe('renamedUniqueField');
    expect(data.updateOneField.isUnique).toBe(true);

    await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: {
          isActive: false,
        },
      },
      gqlFields: `
        id
      `,
    });

    const { data: deletedField, errors: deletedFieldErrors } =
      await deleteOneFieldMetadata({
        input: {
          idToDelete: createdField.createOneField.id,
        },
      });

    expect(deletedField).not.toBeNull();
    expect(deletedFieldErrors).toBeUndefined();
  });

  it('should not update to unique field metadata if it has custom default value', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'fieldWithDefault',
        label: 'Field With Default',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        defaultValue: "'defaultValue'",
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: true },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors[0].message).toBe('Unique field cannot have a default value');
  });

  it('should not update with custom default value if unique field metadata', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'uniqueTestField',
        label: 'Unique Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { defaultValue: "'defaultValue'" },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors[0].message).toBe('Unique field cannot have a default value');
  });

  it('should not update to unique field metadata if it has composite type without unique subfields', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'fullNameField',
        label: 'Full Name Field',
        type: FieldMetadataType.FULL_NAME,
        objectMetadataId: createdObjectMetadataId,
        isUnique: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.createOneField.id,
        updatePayload: { isUnique: true },
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Unique index cannot be created for field fullNameField of type FULL_NAME',
    );
  });
});
