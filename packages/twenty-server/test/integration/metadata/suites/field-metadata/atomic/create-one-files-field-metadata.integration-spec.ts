import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
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

type FilesFieldInput = {
  name: string;
  label: string;
  type: FieldMetadataType.FILES;
  settings?: { maxNumberOfValues: number };
  isUnique?: boolean;
};

type TestContext = EachTestingContext<{
  input: FilesFieldInput;
}>[];

const SUCCESSFUL_TEST_CASES: TestContext = [
  {
    title: 'files field with maxNumberOfValues = 1',
    context: {
      input: {
        name: 'filesFieldOne',
        label: 'Files Field One',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 1,
        },
      },
    },
  },
  {
    title: 'files field with maxNumberOfValues = 5',
    context: {
      input: {
        name: 'filesFieldFive',
        label: 'Files Field Five',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 5,
        },
      },
    },
  },
  {
    title: 'files field with maxNumberOfValues = 10 (max allowed)',
    context: {
      input: {
        name: 'filesFieldTen',
        label: 'Files Field Ten',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 10,
        },
      },
    },
  },
];

const FAILING_TEST_CASES: TestContext = [
  {
    title: 'files field with maxNumberOfValues = 0',
    context: {
      input: {
        name: 'filesFieldInvalid',
        label: 'Files Field Invalid',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 0,
        },
      },
    },
  },
  {
    title: 'files field with maxNumberOfValues = 11 (exceeds max)',
    context: {
      input: {
        name: 'filesFieldExceeds',
        label: 'Files Field Exceeds',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 11,
        },
      },
    },
  },
  {
    title: 'files field without settings',
    context: {
      input: {
        name: 'filesFieldNoSettings',
        label: 'Files Field No Settings',
        type: FieldMetadataType.FILES,
      },
    },
  },
  {
    title: 'files field with isUnique = true',
    context: {
      input: {
        name: 'filesFieldUnique',
        label: 'Files Field Unique',
        type: FieldMetadataType.FILES,
        settings: {
          maxNumberOfValues: 5,
        },
        isUnique: true,
      },
    },
  },
];

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

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should create $title',
    async ({ context: { input } }) => {
      const { data, errors } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: createdObjectMetadataId,
          ...input,
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
      expect(data.createOneField.settings).toEqual(input.settings);
    },
  );
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

  test.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    'should fail to create $title',
    async ({ context: { input } }) => {
      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: createdObjectMetadataId,
          ...input,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
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
