import { createRecordInheritanceRuleQueryFactory } from 'test/integration/metadata/suites/record-inheritance-rule/utils/create-record-inheritance-rule-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type CreateRecordInheritanceRuleInput } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/create-record-inheritance-rule.input';
import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';

export const createRecordInheritanceRule = async (
  input: CreateRecordInheritanceRuleInput,
): Promise<{
  errors?: BaseGraphQLError[];
  recordInheritanceRule?: RecordInheritanceRuleDTO;
}> => {
  const response = await makeMetadataApiRequest(
    createRecordInheritanceRuleQueryFactory(input),
  );

  return {
    errors: response.body.errors,
    recordInheritanceRule: response.body.data?.createRecordInheritanceRule,
  };
};
