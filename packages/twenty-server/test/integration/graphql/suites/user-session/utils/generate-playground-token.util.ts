import { generatePlaygroundTokenQueryFactory } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

export const generatePlaygroundToken = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  generatePlaygroundToken: AuthToken;
}> => {
  const response = await makeMetadataApiRequest(
    generatePlaygroundTokenQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Generating a playground token should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Generating a playground token has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
