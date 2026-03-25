import { UPDATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/update-enum-field-metadata-test-cases';
import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Failing update field metadata %s tests suite v2',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    let createdFieldMetadataId: string;
    const testCases =
      UPDATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { failing: failingTestCases } = testCases;
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
      const {
        labelPlural,
        description,
        labelSingular,
        namePlural,
        nameSingular,
      } = CUSTOM_OBJECT_DISHES;
      const { data } = await createOneObjectMetadata({
        input: {
          labelSingular,
          labelPlural,
          nameSingular,
          description,
          namePlural,
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
        input: {
          idToDelete: createdObjectMetadataId,
        },
        expectToFail: false,
      });
    });

    test.each(eachTestingContextFilter(failingTestCases))(
      'Update $title',
      async ({ context: { input } }) => {
        const { data, errors } = await updateOneFieldMetadata({
          input: {
            idToUpdate: createdFieldMetadataId,
            updatePayload: input,
          },
          gqlFields: `
        id
        options
        `,
        });

        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny(errors),
        );
        expect(errors[0].extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
      },
    );
  },
);
