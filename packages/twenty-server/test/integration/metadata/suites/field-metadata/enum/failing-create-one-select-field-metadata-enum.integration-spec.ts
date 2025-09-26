import { CREATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/create-enum-field-metadata-test-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { isDefined } from 'twenty-shared/utils';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('Failing create field metadata RATING tests suite', () => {
  let createdObjectMetadataId: string;
  const testCases =
    CREATE_ENUM_FIELD_METADATA_TEST_CASES[FieldMetadataType.SELECT];

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

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        labelSingular: 'Enum testing v1',
        labelPlural: 'Enums testings v1',
        nameSingular: 'enumTestingV1',
        namePlural: 'enumsTestingsV1',
        icon: 'IconBuildingSkyscraper',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      expectToFail: false,
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

  test.each(failingTestCases)(
    'Create $title',
    async ({ context: { input } }) => {
      const { data, errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: createdObjectMetadataId,
          type: FieldMetadataType.SELECT,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          ...input,
        },
        gqlFields: `
            id
            options
            defaultValue
            `,
      });

      expect(data).toBeNull();
      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );
});
