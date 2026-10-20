import { deleteRecordInheritanceRuleQueryFactory } from 'test/integration/metadata/suites/record-inheritance-rule/utils/delete-record-inheritance-rule-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const deleteRecordInheritanceRule = (id: string) =>
  makeMetadataApiRequest(deleteRecordInheritanceRuleQueryFactory(id));
