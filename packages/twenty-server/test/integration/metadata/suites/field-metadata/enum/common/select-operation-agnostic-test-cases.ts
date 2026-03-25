import { isDefined } from 'class-validator';
import { BASIC_FAILING_STRING_EDGE_CASE_INPUTS } from 'test/constants/basic-failing-string-edge-case-inputs.constant';
import { SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-and-multi-select-operation-agnostic-tests-cases';
import { type FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';
import { type UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';

const fuzzedDefaultValueFailingTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
  BASIC_FAILING_STRING_EDGE_CASE_INPUTS.filter((el) => isDefined(el.input)).map(
    ({ input, label }) => ({
      title: `should fail with ${label} defaultValue`,
      context: {
        input: {
          defaultValue: input,
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
    }),
  );

export const SELECT_OPERATION_AGNOSTIC_TEST_CASES: FieldMetadataEnumSuccessfulAndFailingTestCases =
  {
    failing: [
      ...fuzzedDefaultValueFailingTestCases,
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
