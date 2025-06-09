import { SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-and-multi-select-operation-agnostic-tests-cases';
import { FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';

export const MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES: FieldMetadataEnumSuccessfulAndFailingTestCases =
  {
    successful: [
      ...SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES.successful,
      // {
      //   title: 'should succeed with valid multi-select default values',
      //   context: {
      //     input: {
      //       defaultValue: ["'OPTION_1'", "'OPTION_2'"],
      //       options: [
      //         {
      //           label: 'Option 1',
      //           value: 'OPTION_1',
      //           color: 'green',
      //           position: 1,
      //         },
      //         {
      //           label: 'Option 2',
      //           value: 'OPTION_2',
      //           color: 'blue',
      //           position: 2,
      //         },
      //       ],
      //     },
      //   },
      // },
    ],
    failing: [
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
  };
