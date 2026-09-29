import { revokeUserSessionQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const revokeUserSession = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<{
  userSessionId: string;
}>): CommonResponseBody<{ revokeUserSession: boolean }> => {
  const response = await makeMetadataApiRequest(
    revokeUserSessionQueryFactory(input),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Revoking a user session should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Revoking a user session has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
