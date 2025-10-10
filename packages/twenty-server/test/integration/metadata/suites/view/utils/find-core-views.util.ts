import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findCoreViewsQueryFactory } from 'test/integration/metadata/suites/view/utils/find-core-views-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const findCoreViews = async ({
  objectMetadataId,
  gqlFields,
  expectToFail,
}: {
  objectMetadataId?: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getCoreViews: ViewEntity[];
}> => {
  const graphqlOperation = findCoreViewsQueryFactory({
    objectMetadataId,
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
