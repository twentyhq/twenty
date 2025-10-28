import { UPDATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/update-enum-field-metadata-test-cases';
import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Failing update field metadata %s tests suite',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    let createdFieldMetadataId: string;
    const testCases =
      UPDATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { failing: failingTestCases } = testCases;

    beforeAll(async () => {
      await updateFeatureFlag({
        expectToFail: false,
        featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        value: false,
      });
    });

    const initialOptions: CreateOneFieldFactoryInput['options'] = [
      {
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'green',
        position: 1,
      },
      {
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 2,
      },
    ];

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: 'failingUpdateEnumField',
          labelPlural: 'failingUpdateEnumFields',
          nameSingular: 'failingUpdateEnumField',
          namePlural: 'failingUpdateEnumFields',
          icon: 'IconBuildingSkyscraper',
          isLabelSyncedWithName: false,
        },
      });

      createdObjectMetadataId = data.createOneObject.id;

      const {
        data: { createOneField },
      } = await createOneFieldMetadata({
        input: {
          objectMetadataId: createdObjectMetadataId,
          type: testedFieldMetadataType,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          options: initialOptions,
        },
        gqlFields: `
          id
          type
          `,
      });

      createdFieldMetadataId = createOneField.id;
    });

    afterAll(async () => {
      await deleteOneObjectMetadata({
        input: {
          idToDelete: createdObjectMetadataId,
        },
        expectToFail: false,
      });
    });

    afterAll(async () => {
      await updateFeatureFlag({
        expectToFail: false,
        featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        value: true,
      });
    });

    test.each(failingTestCases)(
      'Update $title',
      async ({ context: { input } }) => {
        const { ...updatePayload } = input;

        const { data, errors } = await updateOneFieldMetadata({
          expectToFail: true,
          input: {
            idToUpdate: createdFieldMetadataId,
            updatePayload,
          },
          gqlFields: `
        id
        options
        `,
        });

        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors).toMatchSnapshot();
      },
    );
  },
);
