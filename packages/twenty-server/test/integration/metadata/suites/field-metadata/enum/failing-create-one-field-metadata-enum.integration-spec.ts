import { CREATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/create-enum-field-metadata-test-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

describe.each(fieldMetadataEnumTypes)(
  'Failing create field metadata %s tests suite',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    const testCases =
      CREATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { failing: failingTestCases } = testCases;

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: LISTING_NAME_SINGULAR,
          labelPlural: LISTING_NAME_PLURAL,
          nameSingular: LISTING_NAME_SINGULAR,
          namePlural: LISTING_NAME_PLURAL,
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

    test.each(failingTestCases)(
      'Create $title',
      async ({ context: { input } }) => {
        const { data, errors } = await createOneFieldMetadata({
          expectToFail: true,
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
            `,
        });

        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors).toMatchSnapshot();
      },
    );
  },
);
