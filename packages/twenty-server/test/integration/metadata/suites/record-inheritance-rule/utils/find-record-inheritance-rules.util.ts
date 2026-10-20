import { findRecordInheritanceRulesQueryFactory } from 'test/integration/metadata/suites/record-inheritance-rule/utils/find-record-inheritance-rules-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';

export const findRecordInheritanceRules = async (): Promise<
  RecordInheritanceRuleDTO[]
> => {
  const response = await makeMetadataApiRequest(
    findRecordInheritanceRulesQueryFactory(),
  );

  return response.body.data.recordInheritanceRules;
};
