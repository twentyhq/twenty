import { MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/multi-select-operation-agnostic-test-cases';
import { SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-operation-agnostic-test-cases';
import { type FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type EnumFieldMetadataUnionType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

export const UPDATE_ENUM_FIELD_METADATA_TEST_CASES: Partial<
  Record<
    EnumFieldMetadataUnionType,
    FieldMetadataEnumSuccessfulAndFailingTestCases
  >
> = {
  MULTI_SELECT: {
    failing: [
      ...MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
      {
        title: 'should fail with unknown default value and no options',
        context: {
          input: {
            defaultValue: ["'OPTION_42'"],
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
        },
      },
    ],
    successful: [
      ...MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful,
      {
        title: 'should succeed with default value and no options',
        context: {
          input: {
            defaultValue: ["'OPTION_2'"],
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
          expectedOptions: [
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
          ],
        },
      },
    ],
  },
  SELECT: {
    failing: [
      ...SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
      {
        title: 'should fail with unknown default value and no options',
        context: {
          input: {
            defaultValue: "'OPTION_42'",
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
        },
      },
    ],
    successful: [
      ...SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful,
      {
        title: 'should succeed with default value and no options',
        context: {
          input: {
            defaultValue: "'OPTION_2'",
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
          expectedOptions: [
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
          ],
        },
      },
    ],
  },
};
