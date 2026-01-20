import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
    type EachTestingContext,
    eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

type SuccessfulTestContext = EachTestingContext<{
  input: Partial<UpdateFieldInput>;
}>[];

type FailingTestContext = EachTestingContext<{
  input: Partial<UpdateFieldInput>;
}>[];

const SUCCESSFUL_TEST_CASES: SuccessfulTestContext = [
  {
    title: 'files field basic metadata (label, description, icon)',
    context: {
      input: {
        label: 'Updated Files',
        description: 'Updated description',
        icon: 'IconFiles',
      },
    },
  },
  {
    title: 'files field settings with maxNumberOfValues = 5',
    context: {
      input: {
        settings: {
          maxNumberOfValues: 5,
        },
      },
    },
  },
];

const FAILING_TEST_CASES: FailingTestContext = [
  {
    title: 'files field settings with maxNumberOfValues = 0',
    context: {
      input: {
        settings: {
          maxNumberOfValues: 0,
        },
      },
    },
  },
  {
    title: 'files field settings with maxNumberOfValues = 11 (exceeds max)',
    context: {
      input: {
        settings: {
          maxNumberOfValues: 11,
        },
      },
    },
  },
  {
    title: 'files field with isUnique = true',
    context: {
      input: {
        isUnique: true,
      },
    },
  },
];

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

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should update $title',
    async ({ context: { input } }) => {
      const { data, errors } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: input,
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
      expect(data.updateOneField).toMatchObject(input);
    },
  );
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

  test.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    'should fail to update $title',
    async ({ context: { input } }) => {
      const { errors } = await updateOneFieldMetadata({
        expectToFail: true,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: input,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
