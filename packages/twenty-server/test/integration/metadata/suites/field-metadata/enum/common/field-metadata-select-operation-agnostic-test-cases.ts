import { UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/common/field-metadata-select-and-multi-select-operation-agnostic-tests-cases';

export const sucessfulSelectOperationAgnosticTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
  [
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
  ];
