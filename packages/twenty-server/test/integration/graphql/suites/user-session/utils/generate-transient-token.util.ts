import { generateTransientTokenQueryFactory } from 'test/integration/graphql/suites/user-session/utils/generate-transient-token-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type TransientTokenDTO } from 'src/engine/core-modules/auth/dto/transient-token.dto';

export const generateTransientToken = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  generateTransientToken: TransientTokenDTO;
}> => {
  const response = await makeMetadataAPIRequest(
    generateTransientTokenQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Generating a transient token should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Generating a transient token has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
