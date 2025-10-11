import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('update one unique field metadata', () => {
  let createdObjectId = '';

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testObjectToTestUniqueField',
        namePlural: 'testObjectsToTestUniqueFields',
        labelSingular: 'Test Object To Test Unique Field',
        labelPlural: 'Test Objects To Test Unique Fields',
        icon: 'IconTest',
      },
    });

    createdObjectId = objectMetadataId;
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectId },
    });
  });

  it('should update non unique field metadata to unique', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
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
        objectMetadataId: createdObjectId,
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
        objectMetadataId: createdObjectId,
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
        objectMetadataId: createdObjectId,
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
        objectMetadataId: createdObjectId,
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
        objectMetadataId: createdObjectId,
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

  it('should update a standard field to unique field metadata if it has not standard unique index', async () => {
    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectId,
        isUnique: false,
        isCustom: false,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    const { data: addUniqueData, errors: addUniqueErrors } =
      await updateOneFieldMetadata({
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

    expect(addUniqueErrors).toBeUndefined();
    expect(addUniqueData).not.toBeNull();
    expect(addUniqueData.updateOneField).toBeDefined();
    expect(addUniqueData.updateOneField.isUnique).toBe(true);

    const { data: removeUniqueData, errors: removeUniqueErrors } =
      await updateOneFieldMetadata({
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

    expect(removeUniqueErrors).toBeUndefined();
    expect(removeUniqueData).not.toBeNull();
    expect(removeUniqueData.updateOneField).toBeDefined();
    expect(removeUniqueData.updateOneField.isUnique).toBe(false);
  });
});
