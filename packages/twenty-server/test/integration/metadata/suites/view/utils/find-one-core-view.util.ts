import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findCoreViewQueryFactory } from 'test/integration/metadata/suites/view/utils/find-core-view-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

export const findOneCoreView = async ({
  viewId,
  gqlFields,
  expectToFail,
}: {
  viewId: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getCoreView: ViewDTO;
}> => {
  const graphqlOperation = findCoreViewQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
