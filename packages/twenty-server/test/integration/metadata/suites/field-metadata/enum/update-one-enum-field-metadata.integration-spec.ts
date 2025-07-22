import { UPDATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/update-enum-field-metadata-test-cases';
import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

describe.each(fieldMetadataEnumTypes)(
  'Update field metadata %s tests suite',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    const testCases =
      UPDATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { failing: failingTestCases, successful: successfulTestCases } =
      testCases;
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

    beforeEach(async () => {
      const { data } = await createOneObjectMetadata({
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

    it('Should update default value to null even if it was set before', async () => {
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

      const createdFieldMetadata = createOneField.id;
      const isMultiSelect =
        testedFieldMetadataType === FieldMetadataType.MULTI_SELECT;
      const rawDefaultValue = `'${initialOptions[0].value}'`;
      const expectedDefaultValue = isMultiSelect
        ? [rawDefaultValue]
        : rawDefaultValue;

      const { data: firstUpdate } = await updateOneFieldMetadata({
        input: {
          idToUpdate: createdFieldMetadata,
          updatePayload: {
            defaultValue: expectedDefaultValue,
          },
        },
        gqlFields: `
        id
        defaultValue
        `,
      });

      expect(firstUpdate.updateOneField.defaultValue).toEqual(
        expectedDefaultValue,
      );

      const updatedOptions = initialOptions.slice(1);
      const { data: secondUpdate, errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: createdFieldMetadata,
          updatePayload: {
            defaultValue: null,
            options: updatedOptions,
          },
        },
        gqlFields: `
        id
        options
        defaultValue
        `,
      });

      expect(errors).toBeUndefined();
      expect(secondUpdate.updateOneField.defaultValue).toBeNull();
      expect(secondUpdate.updateOneField.options).toMatchObject(updatedOptions);
    });

    test.each(successfulTestCases)(
      'Update $title',
      async ({ context: { input, expectedOptions } }) => {
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

        const createdFieldMetadata = createOneField.id;

        const { ...updatePayload } = input;

        const { data, errors } = await updateOneFieldMetadata({
          input: {
            idToUpdate: createdFieldMetadata,
            updatePayload,
          },
          gqlFields: `
        id
        options
        defaultValue
        `,
        });

        expect(data.updateOneField).toBeDefined();
        const updatedOptions:
          | FieldMetadataComplexOption[]
          | FieldMetadataDefaultOption[]
          | null = data.updateOneField.options;

        expect(updatedOptions).toBeDefined();
        if (!isDefined(updatedOptions))
          throw new Error(
            'Should never occur, type invariant post test assertion',
          );

        expect(errors).toBeUndefined();
        updatedOptions.forEach((option) => expect(option.id).toBeDefined());

        const optionsToCompare = expectedOptions ?? input.options ?? [];

        expect(updatedOptions.length).toBe(optionsToCompare.length);
        expect(updatedOptions).toMatchObject(optionsToCompare);

        if (isDefined(input.defaultValue)) {
          expect(data.updateOneField.defaultValue).toEqual(input.defaultValue);
        }
      },
    );

    test.each(failingTestCases)(
      'Update $title',
      async ({ context: { input } }) => {
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

        const createdFieldMetadata = createOneField.id;

        const { ...updatePayload } = input;

        const { data, errors } = await updateOneFieldMetadata({
          input: {
            idToUpdate: createdFieldMetadata,
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
