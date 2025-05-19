import { faker } from '@faker-js/faker';
import { isDefined } from 'class-validator';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

// faker.seed(42);

type Option = {
  label: string;
  value: string;
  color: string;
  position: number;
};

const generateOption = (index: number): Option => ({
  label: `Option ${index}`,
  value: `option${index}`,
  color: 'green',
  position: index,
});
const generateOptionWithId = (index: number): Option & { id: string } => ({
  ...generateOption(index),
  id: faker.string.uuid(),
});
const generateOptions = (length: number, withId: boolean = false) =>
  Array.from({ length }, (_value, index) =>
    withId ? generateOptionWithId(index) : generateOption(index),
  );
const updateOption = ({ value, label, ...option }: Option) => ({
  ...option,
  value: `${value}_UPDATED`,
  label: `${label} updated`,
});

const ALL_OPTIONS = generateOptions(10);

const isEven = (_value: unknown, index: number) => index % 2 === 0;
describe('updateOne', () => {
  describe('FieldMetadataService Enum Default Value Validation', () => {
    let idToDelete: string;

    const createObjectSelectFieldAndView = async (options: Option[]) => {
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
        gqlFields: `
          id
          nameSingular
        `,
      });

      idToDelete = createOneObject.id;

      const {
        data: { createOneField },
      } = await createOneFieldMetadata({
        input: {
          objectMetadataId: createOneObject.id,
          type: FieldMetadataType.SELECT,
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

    type ViewFilterUpdate = {
      displayValue: string;
      value: string;
    };
    const testCases: EachTestingContext<{
      fieldMetadataOptions: Option[];
      createViewFilter: ViewFilterUpdate;
      updateOptions: (
        options: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
      ) => Option[];
      expected?: null;
    }>[] = [
      // {
      //   title:
      //     'should delete related view filter if all select field options got deleted',
      //   context: {
      //     initial: ALL_OPTIONS,
      //     updateOptions: () => {
      //       const withId = true;
      //       return generateOptions(3, withId);
      //     },
      //     expected: null,
      //   },
      // },
      // {
      //   title: 'should update related view filter label',
      //   context: {
      //     initial: ALL_OPTIONS,
      //     updateOptions: (options) =>
      //       options.map((option, index) =>
      //         isEven(option, index) ? updateOption(option) : option,
      //       ),
      //   },
      // },
      {
        title: 'should update related view filter with updated option',
        context: {
          fieldMetadataOptions: ALL_OPTIONS,
          createViewFilter: {
            displayValue: `${ALL_OPTIONS.length} options`,
            value: ALL_OPTIONS.map((option) => option.value).join(', '),
          },
          updateOptions: (options) =>
            options.map((option, index) =>
              index === 5 ? updateOption(option) : option,
            ),
        },
      },
    ];

    test.each(testCases)(
      '$title',
      async ({
        context: {
          expected,
          createViewFilter,
          fieldMetadataOptions,
          updateOptions,
        },
      }) => {
        const { createOneField, createOneView } =
          await createObjectSelectFieldAndView(fieldMetadataOptions);
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
            value: createViewFilter.value,
            displayValue: createViewFilter.displayValue,
          },
        });

        const optionsWithIds = createOneField.options;

        await updateOneFieldMetadata({
          input: {
            idToUpdate: createOneField.id,
            updatePayload: {
              options: updateOptions(optionsWithIds),
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
          expect(errors).toMatchSnapshot();
          expect(findResponse).toBe(expected);
          return;
        }

        expect(findResponse).toMatchSnapshot({
          id: expect.any(String),
        });
      },
    );
  });
});
