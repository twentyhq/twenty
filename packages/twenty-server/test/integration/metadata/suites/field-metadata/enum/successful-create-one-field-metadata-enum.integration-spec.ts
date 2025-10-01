import { CREATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/create-enum-field-metadata-test-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Successful create field metadata %s tests suite',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    const testCases =
      CREATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { successful: successfulTestCases } = testCases;

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
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: 'successCreateEnumField',
          labelPlural: 'successCreateEnumFields',
          nameSingular: 'successCreateEnumField',
          namePlural: 'successCreateEnumFields',
          icon: 'IconBuildingSkyscraper',
          isLabelSyncedWithName: false,
        },
      });

      createdObjectMetadataId = data.createOneObject.id;
    });

    afterEach(async () => {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: createdObjectMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
        expectToFail: false,
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: createdObjectMetadataId },
      });
    });

    test.each(successfulTestCases)(
      'Create $title',
      async ({ context: { input, expectedOptions } }) => {
        const { data, errors } = await createOneFieldMetadata<
          typeof testedFieldMetadataType
        >({
          input: {
            objectMetadataId: createdObjectMetadataId,
            type: testedFieldMetadataType,
            name: 'testField',
            label: 'Test Field',
            isLabelSyncedWithName: false,
            ...input,
          },
          gqlFields: `
        id
        options
        defaultValue
        type
        `,
        });

        expect(data).not.toBeNull();
        expect(data.createOneField).toBeDefined();
        expect(data.createOneField.type).toEqual(testedFieldMetadataType);

        const createdOptions = data.createOneField.options;
        const optionsToCompare = expectedOptions ?? input.options ?? [];

        expect(errors).toBeUndefined();
        expect(createdOptions?.length).toBe(optionsToCompare.length);
        createdOptions?.forEach((option) => expect(option.id).toBeDefined());
        expect(createdOptions).toMatchObject(optionsToCompare);

        if (isDefined(input.defaultValue)) {
          expect(data.createOneField.defaultValue).toEqual(input.defaultValue);
        }
      },
    );
  },
);
