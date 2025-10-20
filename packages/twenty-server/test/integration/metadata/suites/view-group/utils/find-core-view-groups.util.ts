import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findCoreViewGroupsQueryFactory } from 'test/integration/metadata/suites/view-group/utils/find-core-view-groups-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const findCoreViewGroups = async ({
  viewId,
  gqlFields,
  expectToFail,
}: {
  viewId: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getCoreViewGroups: ViewGroupEntity[];
}> => {
  const graphqlOperation = findCoreViewGroupsQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Group search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Group search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
