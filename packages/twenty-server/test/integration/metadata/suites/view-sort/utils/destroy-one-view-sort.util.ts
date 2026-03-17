import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyViewSortQueryFactory } from 'test/integration/metadata/suites/view-sort/utils/destroy-view-sort-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';

export const destroyOneViewSort = async ({
  input,
  expectToFail,
}: PerformMetadataQueryParams<DestroyViewSortInput>): CommonResponseBody<{
  destroyViewSort: boolean;
}> => {
  const graphqlOperation = destroyViewSortQueryFactory({
    input,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Sort destruction should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Sort destruction has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
