import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-core-view-filter.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { findViewFilterWithRestApi } from 'test/integration/rest/utils/view-rest-api.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type EnumFieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

type Option = FieldMetadataDefaultOption | FieldMetadataComplexOption;

const generateOption = (index: number): Option => ({
  label: `Option ${index}`,
  value: `OPTION_${index}`,
  color: 'green',
  position: index,
});
const generateOptions = (length: number) =>
  Array.from({ length }, (_value, index) => generateOption(index));
const fakeOptionUpdate = ({ value, label, ...option }: Option) => ({
  ...option,
  value: `${value}_UPDATED`,
  label: `${label} updated`,
});

const ALL_OPTIONS = generateOptions(10);

const isEven = (_value: unknown, index: number) => index % 2 === 0;

type ViewFilterUpdate = {
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

describe('update-one-field-metadata-view-filters-side-effect-v2', () => {
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
      expectToFail: false,
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
      expectToFail: false,
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
      data: { createCoreView: createdView },
    } = await createOneCoreView({
      input: {
        id: faker.string.uuid(),
        icon: '123Icon',
        name: 'Test View',
        objectMetadataId: createOneObject.id,
        type: ViewType.TABLE,
      },
      expectToFail: false,
      gqlFields: `
        id
      `,
    });

    return { createOneObject, createOneField, createdView };
  };

  afterEach(async () => {
    if (isDefined(idToDelete)) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: idToDelete,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
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
              isEven(option, index) ? fakeOptionUpdate(option) : option,
            ),
        },
      },
      {
        title: 'should update related solo selected option view filter',
        context: {
          createViewFilter: {
            value: [ALL_OPTIONS[5].value],
          },
          updateOptions: (options) => [fakeOptionUpdate(options[5])],
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
            value: ALL_OPTIONS.slice(0, 2).map((option) => option.value),
          },
          updateOptions: (options) => [
            ...options,
            ...generateOptions(6).slice(5),
          ],
        },
      },
    ];

    test.each(eachTestingContextFilter(testCases))(
      '$title',
      async ({
        context: {
          expected,
          createViewFilter = {
            value: ALL_OPTIONS.map((option) => option.value),
          },
          fieldMetadata = { options: ALL_OPTIONS, type: fieldType },
          updateOptions,
        },
      }) => {
        const { createOneField, createdView } =
          await createObjectSelectFieldAndView(fieldMetadata);

        const {
          data: { createCoreViewFilter: createdViewFilter },
        } = await createOneCoreViewFilter({
          input: {
            viewId: createdView.id,
            fieldMetadataId: createOneField.id,
            operand: ViewFilterOperand.IS,
            value: createViewFilter.value,
          },
          expectToFail: false,
          gqlFields: `
            id
          `,
        });

        const optionsWithIds = createOneField.options;

        if (!isDefined(optionsWithIds)) {
          throw new Error('optionsWithIds is not defined');
        }
        const updatedOptions = updateOptions(optionsWithIds);

        await updateOneFieldMetadata({
          expectToFail: false,
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

        const updatedViewFilter = await findViewFilterWithRestApi(
          createdViewFilter.id,
        );

        if (expected !== undefined) {
          expect(updatedViewFilter).toBe(expected);

          return;
        }

        if (!isDefined(updatedViewFilter)) {
          throw new Error(
            'updatedViewFilter is not defined but should be at this point',
          );
        }

        expect(updatedViewFilter.value).not.toBeNull();
        if (updatedViewFilter.value === null) {
          throw new Error('Invariant parsedValue should not be null');
        }
        expect(updatedOptions.map((option) => option.value)).toEqual(
          expect.arrayContaining(updatedViewFilter.value as string[]),
        );

        expect({
          value: updatedViewFilter.value,
          operand: updatedViewFilter.operand,
          viewFilterGroupId: updatedViewFilter.viewFilterGroupId,
          positionInViewFilterGroup:
            updatedViewFilter.positionInViewFilterGroup,
          subFieldName: updatedViewFilter.subFieldName,
        }).toMatchSnapshot();
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

    test.each(eachTestingContextFilter(failingTestCases))(
      '$title',
      async ({ context: { createViewFilterValue } }) => {
        const { createOneField, createdView } =
          await createObjectSelectFieldAndView({
            options: ALL_OPTIONS,
            type: fieldType,
          });

        const viewFilterId = '20202020-e3b5-4fa7-85aa-9b1950fc7bf5';

        await createOneCoreViewFilter({
          input: {
            id: viewFilterId,
            viewId: createdView.id,
            fieldMetadataId: createOneField.id,
            operand: ViewFilterOperand.IS,
            value: createViewFilterValue as unknown as ViewFilterValue,
          },
          expectToFail: false,
          gqlFields: `
            id
          `,
        });

        const optionsWithIds = createOneField.options;

        if (!isDefined(optionsWithIds)) {
          throw new Error('optionsWithIds is not defined');
        }
        const updatePayload = {
          options: optionsWithIds.map((option) => fakeOptionUpdate(option)),
        };
        const { errors, data } = await updateOneFieldMetadata({
          expectToFail: true,
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
