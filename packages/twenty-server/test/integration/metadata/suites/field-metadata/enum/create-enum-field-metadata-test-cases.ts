import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { EnumFieldMetadataUnionType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-and-multi-select-operation-agnostic-tests-cases';
import { SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-operation-agnostic-test-cases';
import { FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';
import { UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';

const fieldMetadataTypeAgnosticCreateFailingTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
  [
    {
      title: 'should fail with null options',
      context: {
        input: {
          options: null as unknown as FieldMetadataComplexOption[],
        },
      },
    },
    {
      title: 'should fail with undefined options',
      context: {
        input: {
          options: undefined as unknown as FieldMetadataComplexOption[],
        },
      },
    },
  ];

export const CREATE_ENUM_FIELD_METADATA_TEST_CASES: Record<
  EnumFieldMetadataUnionType,
  FieldMetadataEnumSuccessfulAndFailingTestCases
> = {
  RATING: {
    failing: [],
    successful: [],
  },
  MULTI_SELECT: {
    failing: [
      ...fieldMetadataTypeAgnosticCreateFailingTestCases,
      ...SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES.failing,
      {
        title: 'should fail with non stringified array default value',
        context: {
          input: {
            defaultValue: 'Option_1',
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with empty multi-select default values array',
        context: {
          input: {
            defaultValue: [],
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with unknown multi-select default values',
        context: {
          input: {
            defaultValue: ["'OPTION_1'", "'UNKNOWN_OPTION'"],
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with invalid multi-select default value format',
        context: {
          input: {
            defaultValue: ['invalid', 'format'],
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
    ],
    successful: [
      ...SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES.successful,
      {
        title: 'should succeed with valid multi-select default values',
        context: {
          input: {
            defaultValue: ["'OPTION_1'", "'OPTION_2'"],
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
              {
                label: 'Option 2',
                value: 'OPTION_2',
                color: 'blue',
                position: 2,
              },
            ],
          },
        },
      },
    ],
  },
  SELECT: {
    failing: [
      ...SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
      ...fieldMetadataTypeAgnosticCreateFailingTestCases,
    ],
    successful: [...SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful],
  },
};
