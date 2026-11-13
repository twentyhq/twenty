import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findViewTabsQueryFactory } from 'test/integration/metadata/suites/view-tab/utils/find-view-tabs-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';

export const findViewTabs = async ({
  viewId,
  gqlFields,
  expectToFail,
}: {
  viewId: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getViewTabs: ViewTabEntity[];
}> => {
  const graphqlOperation = findViewTabsQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Tab search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Tab search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
