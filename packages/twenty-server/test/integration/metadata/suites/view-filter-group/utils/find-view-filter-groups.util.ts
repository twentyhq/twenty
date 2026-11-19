import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findViewFilterGroupsQueryFactory } from 'test/integration/metadata/suites/view-filter-group/utils/find-view-filter-groups-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';

export const findViewFilterGroups = async ({
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
  getViewFilterGroups: ViewFilterGroupDTO[];
}> => {
  const graphqlOperation = findViewFilterGroupsQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter Group search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Filter Group search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
