import { SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-and-multi-select-operation-agnostic-tests-cases';
import { FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';

export const SELECT_OPERATION_AGNOSTIC_TEST_CASES: FieldMetadataEnumSuccessfulAndFailingTestCases =
  {
    failing: [
      ...SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES.failing,
    ],
    successful: [
      ...SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES.successful,
      {
        title: 'should succeed with valid default value',
        context: {
          input: {
            defaultValue: "'OPTION_1'",
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
                id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
              },
            ],
          },
        },
      },
      {
        title: 'should succeed with null default value',
        context: {
          input: {
            defaultValue: null,
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
                id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
              },
            ],
          },
        },
      },
    ],
  };
