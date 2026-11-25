import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findOneViewGroupQueryFactory } from 'test/integration/metadata/suites/view-group/utils/find-one-view-group-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';

export const findOneViewGroup = async ({
  id,
  gqlFields,
  expectToFail,
  token,
}: {
  id: string;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  getViewGroup: ViewGroupDTO;
}> => {
  const graphqlOperation = findOneViewGroupQueryFactory({
    id,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

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
