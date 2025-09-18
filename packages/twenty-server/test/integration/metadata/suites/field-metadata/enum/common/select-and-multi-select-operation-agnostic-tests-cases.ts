import { BASIC_FAILING_STRING_EDGE_CASE_INPUTS } from 'test/constants/basic-failing-string-edge-case-inputs.constant';
import { type FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';
import { type UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';
import { v4 } from 'uuid';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

const stringFields: (keyof FieldMetadataComplexOption)[] = [
  'id',
  'label',
  'value',
];
const fuzzedOptionsStringFieldFailingTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
  stringFields.flatMap((field) => {
    return BASIC_FAILING_STRING_EDGE_CASE_INPUTS.map<UpdateCreateFieldMetadataSelectTestCase>(
      ({ input, label }) => ({
        title: `should fail with ${label} ${field}`,
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
                [field]: input,
              },
            ],
          },
        },
      }),
    );
  });

export const SELECT_AND_MULTI_SELECT_OPERATION_AGNOSTIC_SUCCESSFUL_AND_FAILING_TEST_CASES: FieldMetadataEnumSuccessfulAndFailingTestCases =
  {
    failing: [
      ...fuzzedOptionsStringFieldFailingTestCases,
      {
        title: 'should fail with invalid option id',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
                id: 'not a uuid',
              },
            ],
          },
        },
      },
      {
        title: 'should fail with empty options',
        context: {
          input: {
            options: [],
          },
        },
      },
      {
        title: 'should fail with invalid option value format',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: 'Option 1 and some other things, /',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with comma in option label',
        context: {
          input: {
            options: [
              {
                label: 'Option ,1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with duplicated option values',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 0,
              },
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
        title: 'should fail with duplicated option ids',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 1,
                id: 'fd1f11fd-3f05-4a33-bddf-800c3412ce98',
              },
              {
                label: 'Option 2',
                value: 'OPTION_2',
                color: 'green',
                position: 2,
                id: 'fd1f11fd-3f05-4a33-bddf-800c3412ce98',
              },
            ],
          },
        },
      },
      {
        title: 'should fail with duplicated option positions',
        context: {
          input: {
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
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with duplicated trimmed option values',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: '         OPTION_1                   ',
                color: 'green',
                position: 1,
              },
              {
                label: 'Option 2',
                value: '   OPTION_1        ',
                color: 'green',
                position: 2,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with undefined option label',
        context: {
          input: {
            options: [
              {
                label: undefined as unknown as string,
                value: 'OPTION_1',
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
      {
        title: 'should fail with an invalid default value',
        context: {
          input: {
            defaultValue: 'invalid',
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
        title: 'should fail with an unknown default value',
        context: {
          input: {
            defaultValue: "'OPTION_424242'",
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
        title: 'should fail with undefined option value',
        context: {
          input: {
            options: [
              {
                label: 'Option 1',
                value: undefined as unknown as string,
                color: 'green',
                position: 1,
              },
            ],
          },
        },
      },
    ],
    successful: [
      {
        title: 'should succeed with provided option id',
        context: {
          input: {
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
        title: 'should succeed with various options id',
        context: {
          input: {
            options: Array.from({ length: 42 }, (_value, index) => {
              const optionWithoutId: FieldMetadataComplexOption = {
                label: `Option ${index}`,
                value: `OPTION_${index}`,
                color: 'green',
                position: index,
              };

              if (index % 2 === 0) {
                return {
                  ...optionWithoutId,
                  id: v4(),
                };
              }

              return optionWithoutId;
            }),
          },
        },
      },
      {
        title: 'should succeed without option id',
        context: {
          input: {
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
        title: 'should trim option values',
        context: {
          input: {
            options: [
              {
                label: '       Option        1       ',
                value: '        OPTION_1        ',
                color: 'green',
                position: 1,
              },
            ],
          },
          expectedOptions: [
            {
              label: 'Option 1',
              value: 'OPTION_1',
              color: 'green',
              position: 1,
            },
          ],
        },
      },
    ],
  };
