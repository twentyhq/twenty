import { type UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';
import { type SuccessfulAndFailingTestCases } from 'twenty-shared/testing';

export type FieldMetadataEnumSuccessfulAndFailingTestCases =
  SuccessfulAndFailingTestCases<
    UpdateCreateFieldMetadataSelectTestCase['context']
  >;
