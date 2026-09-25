import {
  type AuthorizeAppFactoryInput,
  authorizeAppQueryFactory,
} from 'test/integration/graphql/suites/user-session/utils/authorize-app-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AuthorizeAppDTO } from 'src/engine/core-modules/auth/dto/authorize-app.dto';

export const authorizeApp = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<AuthorizeAppFactoryInput>): CommonResponseBody<{
  authorizeApp: AuthorizeAppDTO;
}> => {
  const response = await makeMetadataAPIRequest(
    authorizeAppQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Authorizing an app should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Authorizing an app has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
