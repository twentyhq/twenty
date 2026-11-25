import { findAccessGroupPropagationProgressQueryFactory } from 'test/integration/metadata/suites/role/utils/find-access-group-propagation-progress-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AccessGroupPropagationProgressDTO } from 'src/engine/permissions/dtos/access-group-propagation-progress.dto';

export const findAccessGroupPropagationProgress = async ({
  expectToFail,
  token,
}: {
  expectToFail?: boolean;
  token?: string;
} = {}): CommonResponseBody<{
  accessGroupPropagationProgress: AccessGroupPropagationProgressDTO;
}> => {
  const response = await makeMetadataApiRequest(
    findAccessGroupPropagationProgressQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Access group propagation progress search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Access group propagation progress search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
