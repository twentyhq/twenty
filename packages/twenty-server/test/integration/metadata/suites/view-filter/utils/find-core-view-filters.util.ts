import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findCoreViewFiltersQueryFactory } from 'test/integration/metadata/suites/view-filter/utils/find-core-view-filters-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';

export const findCoreViewFilters = async ({
  viewId,
  gqlFields,
  expectToFail,
}: {
  viewId?: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getCoreViewFilters: ViewFilterDTO[];
}> => {
  const graphqlOperation = findCoreViewFiltersQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Filter search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
