import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('createOne FILES field metadata - successful', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFilesFieldObject',
        namePlural: 'testFilesFieldObjects',
        labelSingular: 'Test Files Field Object',
        labelPlural: 'Test Files Field Objects',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should create files field with maxNumberOfValues = 1', async () => {
    const { data, errors } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldOne',
        label: 'Files Field One',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 1 },
      },
      gqlFields: `
        id
        type
        name
        label
        settings
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.createOneField).toBeDefined();
    expect(data.createOneField.type).toBe(FieldMetadataType.FILES);
    expect(data.createOneField.settings).toEqual({ maxNumberOfValues: 1 });
  });

  it('should create files field with maxNumberOfValues = 5', async () => {
    const { data, errors } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldFive',
        label: 'Files Field Five',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 5 },
      },
      gqlFields: `
        id
        type
        name
        label
        settings
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.createOneField).toBeDefined();
    expect(data.createOneField.type).toBe(FieldMetadataType.FILES);
    expect(data.createOneField.settings).toEqual({ maxNumberOfValues: 5 });
  });

  it('should create files field with maxNumberOfValues = 10 (max allowed)', async () => {
    const { data, errors } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldTen',
        label: 'Files Field Ten',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 10 },
      },
      gqlFields: `
        id
        type
        name
        label
        settings
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    expect(data.createOneField).toBeDefined();
    expect(data.createOneField.type).toBe(FieldMetadataType.FILES);
    expect(data.createOneField.settings).toEqual({ maxNumberOfValues: 10 });
  });
});

describe('createOne FILES field metadata - failing', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFilesFieldFailingObject',
        namePlural: 'testFilesFieldFailingObjects',
        labelSingular: 'Test Files Field Failing Object',
        labelPlural: 'Test Files Field Failing Objects',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should fail to create files field with maxNumberOfValues = 0', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldInvalid',
        label: 'Files Field Invalid',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 0 },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail to create files field with maxNumberOfValues = 11 (exceeds max)', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldExceeds',
        label: 'Files Field Exceeds',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 11 },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail to create files field without settings', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldNoSettings',
        label: 'Files Field No Settings',
        type: FieldMetadataType.FILES,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail to create files field with isUnique = true', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldUnique',
        label: 'Files Field Unique',
        type: FieldMetadataType.FILES,
        settings: { maxNumberOfValues: 5 },
        isUnique: true,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});

describe('createOne FILES field metadata - feature flag disabled', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: false,
      expectToFail: false,
    });

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFilesFieldFlagDisabledObject',
        namePlural: 'testFilesFieldFlagDisabledObjects',
        labelSingular: 'Test Files Field Flag Disabled Object',
        labelPlural: 'Test Files Field Flag Disabled Objects',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should fail to create files field when feature flag is disabled', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: createdObjectMetadataId,
        name: 'filesFieldDisabled',
        label: 'Files Field Disabled',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 5,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
