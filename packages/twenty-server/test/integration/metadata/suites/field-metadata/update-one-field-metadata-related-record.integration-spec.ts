import { faker } from '@faker-js/faker';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';
import { EnumFieldMetadataType, FieldMetadataType } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

type Option = FieldMetadataDefaultOption | FieldMetadataComplexOption;

const generateOption = (index: number): Option => ({
  label: `Option ${index}`,
  value: `OPTION_${index}`,
  color: 'green',
  position: index,
});
const generateOptions = (length: number) =>
  Array.from({ length }, (_value, index) => generateOption(index));
const updateOption = ({ value, label, ...option }: Option) => ({
  ...option,
  value: `${value}_UPDATED`,
  label: `${label} updated`,
});

const ALL_OPTIONS = generateOptions(10);

const isEven = (_value: unknown, index: number) => index % 2 === 0;

type ViewFilterUpdate = {
  displayValue: string;
  value: string[];
};

type FieldMetadataOptionsAndType = {
  options: Option[];
  type: EnumFieldMetadataType;
};

type TestCase = EachTestingContext<{
  fieldMetadata?: FieldMetadataOptionsAndType;
  createViewFilter?: ViewFilterUpdate;
  updateOptions: (
    options: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
  ) => FieldMetadataDefaultOption[] | FieldMetadataComplexOption[];
  expected?: null;
}>;
const testFieldMetadataType: EnumFieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
];

describe('update-one-field-metadata-related-record', () => {
  let idToDelete: string;

  const createObjectSelectFieldAndView = async ({
    options,
    type: fieldMetadataType,
  }: FieldMetadataOptionsAndType) => {
    const singular = faker.lorem.words();
    const plural = singular + faker.lorem.word();
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        labelSingular: singular,
        labelPlural: plural,
        nameSingular: singular.split(' ').join(''),
        namePlural: plural.split(' ').join(''),
        isLabelSyncedWithName: false,
      }),
    });

    idToDelete = createOneObject.id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata<typeof fieldMetadataType>({
      input: {
        objectMetadataId: createOneObject.id,
        type: fieldMetadataType,
        name: 'testName',
        label: 'Test name',
        isLabelSyncedWithName: true,
        options,
      },
      gqlFields: `
        id
        options
        `,
    });

    const {
      data: { createOneResponse: createOneView },
    } = await createOneOperation<{
      id: string;
      objectMetadataId: string;
      type: string;
    }>({
      objectMetadataSingularName: 'view',
      input: {
        id: faker.string.uuid(),
        objectMetadataId: createOneObject.id,
        type: 'table',
      },
    });

    return { createOneObject, createOneField, createOneView };
  };

  afterEach(async () => {
    if (isDefined(idToDelete)) {
      await deleteOneObjectMetadata({
        input: { idToDelete: idToDelete },
      });
    }
  });

  describe.each(testFieldMetadataType)('%s', (fieldType) => {
    const testCases: TestCase[] = [
      {
        title:
          'should delete related view filter if all select field options got deleted',
        context: {
          updateOptions: () => generateOptions(3),
          expected: null,
        },
      },
      {
        title: 'should update related multi selected options view filter',
        context: {
          updateOptions: (options) =>
            options.map((option, index) =>
              isEven(option, index) ? updateOption(option) : option,
            ),
        },
      },
      {
        title: 'should update related solo selected option view filter',
        context: {
          createViewFilter: {
            displayValue: ALL_OPTIONS[5].label,
            value: [ALL_OPTIONS[5].value],
          },
          updateOptions: (options) => [updateOption(options[5])],
        },
      },
      {
        title:
          'should handle partial deletion of selected options in view filter',
        context: {
          updateOptions: (options) => options.slice(4),
        },
      },
      {
        title:
          'should handle reordering of options while maintaining view filter values',
        context: {
          createViewFilter: {
            displayValue: '2 options',
            value: ALL_OPTIONS.slice(0, 2).map((option) => option.value),
          },
          updateOptions: (options) => [...options].reverse(),
        },
      },
      {
        title:
          'should handle no changes update of options while maintaining existing view filter values',
        context: {
          updateOptions: (options) => options,
        },
      },
      {
        title:
          'should handle adding new options while maintaining existing view filter',
        context: {
          fieldMetadata: {
            options: ALL_OPTIONS.slice(0, 5),
            type: fieldType,
          },
          createViewFilter: {
            displayValue: '2 options',
            value: ALL_OPTIONS.slice(0, 2).map((option) => option.value),
          },
          updateOptions: (options) => [
            ...options,
            ...generateOptions(6).slice(5),
          ],
        },
      },
      {
        title:
          'should update display value with options label if less than 3 options are selected',
        context: {
          updateOptions: (options) => options.slice(8),
        },
      },
      {
        title: 'should update the display value on an option label change only',
        context: {
          createViewFilter: {
            displayValue: 'Option 3',
            value: ALL_OPTIONS.slice(0, 3).map((option) => option.value),
          },
          updateOptions: (options) =>
            options.map((option) => ({
              ...option,
              label: `${option.label} updated`,
            })),
        },
      },
    ];

    test.each(testCases)(
      '$title',
      async ({
        context: {
          expected,
          createViewFilter = {
            displayValue: '10 options',
            value: ALL_OPTIONS.map((option) => option.value),
          },
          fieldMetadata = { options: ALL_OPTIONS, type: fieldType },
          updateOptions,
        },
      }) => {
        const { createOneField, createOneView } =
          await createObjectSelectFieldAndView(fieldMetadata);
        const {
          data: { createOneResponse: createOneViewFilter },
        } = await createOneOperation<{
          id: string;
          viewId: string;
          fieldMetadataId: string;
          operand: string;
          value: string;
          displayValue: string;
        }>({
          objectMetadataSingularName: 'viewFilter',
          input: {
            id: faker.string.uuid(),
            viewId: createOneView.id,
            fieldMetadataId: createOneField.id,
            operand: 'is',
            value: JSON.stringify(createViewFilter.value),
            displayValue: createViewFilter.displayValue,
          },
        });

        const optionsWithIds = createOneField.options;

        if (!isDefined(optionsWithIds)) {
          throw new Error('optionsWithIds is not defined');
        }
        const updatedOptions = updateOptions(optionsWithIds);

        await updateOneFieldMetadata({
          input: {
            idToUpdate: createOneField.id,
            updatePayload: {
              options: updatedOptions,
            },
          },
          gqlFields: `
          id
          options
        `,
        });

        const {
          data: { findResponse },
          errors,
        } = await findOneOperation({
          gqlFields: `
        id
        displayValue
        value
        `,
          objectMetadataSingularName: 'viewFilter',
          filter: {
            id: { eq: createOneViewFilter.id },
          },
        });

        if (expected !== undefined) {
          expect(findResponse).toBe(expected);
          expect(errors).toMatchSnapshot();

          return;
        }

        const parsedViewFilterValues = parseJson<string[]>(findResponse.value);

        expect(parsedViewFilterValues).not.toBeNull();
        if (parsedViewFilterValues === null) {
          throw new Error('Invariant parsedValue should not be null');
        }
        expect(updatedOptions.map((option) => option.value)).toEqual(
          expect.arrayContaining(parsedViewFilterValues),
        );

        expect(findResponse).toMatchSnapshot({
          id: expect.any(String),
        });
      },
    );

    // Note these test exists only because we do not validate the view filter value on creation/update
    // Should be removed after https://github.com/twentyhq/core-team-issues/issues/1009 completion
    const failingTestCases: EachTestingContext<{
      createViewFilterValue: unknown;
    }>[] = [
      {
        title:
          'should throw error if view filter value is not a stringified JSON array',
        context: {
          createViewFilterValue: JSON.stringify(
            'not an array stringified json',
          ),
        },
      },
    ];

    test.each(failingTestCases)(
      '$title',
      async ({ context: { createViewFilterValue } }) => {
        const { createOneField, createOneView } =
          await createObjectSelectFieldAndView({
            options: ALL_OPTIONS,
            type: fieldType,
          });

        const viewFilterId = '20202020-e3b5-4fa7-85aa-9b1950fc7bf5';

        await createOneOperation<{
          id: string;
          viewId: string;
          fieldMetadataId: string;
          operand: string;
          value: string;
          displayValue: string;
        }>({
          objectMetadataSingularName: 'viewFilter',
          input: {
            id: viewFilterId,
            viewId: createOneView.id,
            fieldMetadataId: createOneField.id,
            operand: 'is',
            value: createViewFilterValue as unknown as string,
            displayValue: '10 options',
          },
        });

        const optionsWithIds = createOneField.options;

        if (!isDefined(optionsWithIds)) {
          throw new Error('optionsWithIds is not defined');
        }
        const updatePayload = {
          options: optionsWithIds.map((option) => updateOption(option)),
        };
        const { errors, data } = await updateOneFieldMetadata({
          input: {
            idToUpdate: createOneField.id,
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
  });
});
