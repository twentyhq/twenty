import { CREATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/create-enum-field-metadata-test-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Create field metadata %s tests suite',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    const testCases =
      CREATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { failing: failingTestCases, successful: successfulTestCases } =
      testCases;

    beforeEach(async () => {
      const { data } = await forceCreateOneObjectMetadata({
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

    afterEach(async () => {
      await deleteOneObjectMetadata({
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

    test.each(failingTestCases)(
      'Create $title',
      async ({ context: { input } }) => {
        const { data, errors } = await createOneFieldMetadata({
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
