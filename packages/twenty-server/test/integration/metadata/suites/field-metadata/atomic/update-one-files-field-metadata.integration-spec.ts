import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('updateOne FILES field metadata - successful', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFilesUpdateObject',
        namePlural: 'testFilesUpdateObjects',
        labelSingular: 'Test Files Update Object',
        labelPlural: 'Test Files Update Objects',
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

  beforeEach(async () => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.FILES,
        name: 'testFiles',
        label: 'Test Files',
        description: 'Initial description',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
        settings: {
          maxNumberOfValues: 5,
        },
      },
      gqlFields: `
        id
      `,
    });

    createdFieldMetadataId = data.createOneField.id;
  });

  afterEach(async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: createdFieldMetadataId },
    });
  });

  it('should update files field basic metadata (label, description, icon)', async () => {
    const updatePayload = {
      label: 'Updated Files',
      description: 'Updated description',
      icon: 'IconFiles',
    };

    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload,
      },
      gqlFields: `
        id
        type
        name
        label
        description
        icon
        settings
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField).toMatchObject(updatePayload);
  });

  it('should update files field settings with maxNumberOfValues = 5', async () => {
    const updatePayload = {
      settings: { maxNumberOfValues: 5 },
    };

    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload,
      },
      gqlFields: `
        id
        type
        name
        label
        description
        icon
        settings
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField).toMatchObject(updatePayload);
  });
});

describe('updateOne FILES field metadata - failing', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_FILES_FIELD_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testFilesUpdateFailingObject',
        namePlural: 'testFilesUpdateFailingObjects',
        labelSingular: 'Test Files Update Failing Object',
        labelPlural: 'Test Files Update Failing Objects',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.FILES,
        name: 'testFilesForFailure',
        label: 'Test Files For Failure',
        description: 'Initial description',
        icon: 'IconFile',
        isLabelSyncedWithName: false,
        settings: {
          maxNumberOfValues: 5,
        },
      },
      gqlFields: `
        id
      `,
    });

    createdFieldMetadataId = fieldData.createOneField.id;
  });

  afterAll(async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: createdFieldMetadataId },
    });

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

  it('should fail to update files field settings with maxNumberOfValues = 0', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          settings: { maxNumberOfValues: 0 },
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail to update files field settings with maxNumberOfValues = 11 (exceeds max)', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          settings: { maxNumberOfValues: 11 },
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail to update files field with isUnique = true', async () => {
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          isUnique: true,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
