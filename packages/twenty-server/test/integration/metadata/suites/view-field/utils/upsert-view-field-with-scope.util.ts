import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { upsertViewFieldWithScopeQueryFactory } from 'test/integration/metadata/suites/view-field/utils/upsert-view-field-with-scope-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpsertViewFieldWithScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/upsert-view-field-with-scope.input';
import { type ViewFieldWithScopeDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field-with-scope.dto';

export const upsertViewFieldWithScope = async ({
  input,
  gqlFields,
  expectToFail,
  token,
}: PerformMetadataQueryParams<UpsertViewFieldWithScopeInput>): CommonResponseBody<{
  upsertViewFieldWithScope: ViewFieldWithScopeDTO;
}> => {
  const graphqlOperation = upsertViewFieldWithScopeQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'View field with scope upsert should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View field with scope upsert has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
