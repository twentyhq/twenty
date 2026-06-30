import { upsertRowLevelPermissionPredicatesQueryFactory } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { type RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

export const upsertRowLevelPermissionPredicates = async ({
  input,
  gqlFields,
  expectToFail = false,
}: Omit<
  PerformMetadataQueryParams<UpsertRowLevelPermissionPredicatesInput>,
  'gqlFields'
> & {
  gqlFields?: {
    predicates?: string;
    predicateGroups?: string;
  };
}): CommonResponseBody<{
  upsertRowLevelPermissionPredicates: {
    predicates: RowLevelPermissionPredicateDTO[];
    predicateGroups: RowLevelPermissionPredicateGroupDTO[];
  };
}> => {
  const graphqlOperation = upsertRowLevelPermissionPredicatesQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Row Level Permission Predicates upsert should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Row Level Permission Predicates upsert has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
