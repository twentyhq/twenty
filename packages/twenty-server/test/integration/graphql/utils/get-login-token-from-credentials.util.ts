import {
  type GetLoginTokenFromCredentialsFactoryInput,
  getLoginTokenFromCredentialsQueryFactory,
} from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type LoginTokenDTO } from 'src/engine/core-modules/auth/dto/login-token.dto';

type GetLoginTokenFromCredentialsUtilArgs = {
  input: GetLoginTokenFromCredentialsFactoryInput;
  expectToFail?: boolean;
};

export const getLoginTokenFromCredentials = async ({
  input,
  expectToFail,
}: GetLoginTokenFromCredentialsUtilArgs): CommonResponseBody<{
  getLoginTokenFromCredentials: LoginTokenDTO;
}> => {
  const response = await makeMetadataApiRequest(
    getLoginTokenFromCredentialsQueryFactory(input),
    null,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Login with credentials should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Login with credentials has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
