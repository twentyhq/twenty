import { MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/multi-select-operation-agnostic-test-cases';
import { SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/select-operation-agnostic-test-cases';
import { type FieldMetadataEnumSuccessfulAndFailingTestCases } from 'test/integration/metadata/suites/field-metadata/enum/types/fieldMetadataEnumSuccessfulAndFailingTestCases';
import { type UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type EnumFieldMetadataUnionType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

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

export const CREATE_ENUM_FIELD_METADATA_TEST_CASES: Partial<
  Record<
    EnumFieldMetadataUnionType,
    FieldMetadataEnumSuccessfulAndFailingTestCases
  >
> = {
  MULTI_SELECT: {
    failing: [
      ...MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
      ...fieldMetadataTypeAgnosticCreateFailingTestCases,
    ],
    successful: [...MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful],
  },
  SELECT: {
    failing: [
      ...SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
      ...fieldMetadataTypeAgnosticCreateFailingTestCases,
    ],
    successful: [...SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful],
  },
};
