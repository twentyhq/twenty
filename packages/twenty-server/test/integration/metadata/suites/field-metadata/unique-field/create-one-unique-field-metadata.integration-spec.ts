import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('create one unique field metadata', () => {
  let createdObjectMetadataId = '';

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

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
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  it('should create one unique field metadata', async () => {
    const createFieldInput = {
      name: 'uniqueTestField',
      label: 'Unique Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    };

    const { data, errors } = await createOneFieldMetadata({
      input: createFieldInput,
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
    expect(data.createOneField).toBeDefined();
    expect(data.createOneField.name).toBe('uniqueTestField');
    expect(data.createOneField.isUnique).toBe(true);
  });

  it('should not create unique field metadata if it has custom default value', async () => {
    const createFieldInput = {
      name: 'uniqueFieldWithDefault',
      label: 'Unique Field With Default',
      type: FieldMetadataType.TEXT,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
      defaultValue: "'?'",
    };

    const { data, errors } = await createOneFieldMetadata({
      input: createFieldInput,
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

  it('should not create unique field metadata for composite type without unique subfields', async () => {
    const createFieldInput = {
      name: 'uniqueFullName',
      label: 'Unique Full Name',
      type: FieldMetadataType.FULL_NAME,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    };

    const { data, errors } = await createOneFieldMetadata({
      input: createFieldInput,
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
      'Unique index cannot be created for field uniqueFullName of type FULL_NAME',
    );
  });

  it('should create unique field metadata for composite type with unique subfields', async () => {
    const createFieldInput = {
      name: 'uniqueEmails',
      label: 'Unique Emails',
      type: FieldMetadataType.EMAILS,
      objectMetadataId: createdObjectMetadataId,
      isUnique: true,
    };

    const { data, errors } = await createOneFieldMetadata({
      input: createFieldInput,
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
    expect(data.createOneField).toBeDefined();
    expect(data.createOneField.name).toBe('uniqueEmails');
    expect(data.createOneField.isUnique).toBe(true);
  });
});
