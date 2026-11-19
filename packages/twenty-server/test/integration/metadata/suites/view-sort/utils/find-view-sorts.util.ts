import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findViewSortsQueryFactory } from 'test/integration/metadata/suites/view-sort/utils/find-view-sorts-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export const findViewSorts = async ({
  viewId,
  gqlFields,
  expectToFail,
  token,
}: {
  viewId?: string;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  getViewSorts: ViewSortDTO[];
}> => {
  const graphqlOperation = findViewSortsQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Sort search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Sort search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
