import { currentUserSessionsQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UserSessionDTO } from 'src/engine/core-modules/user-session/dtos/user-session.dto';

export const currentUserSessions = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  currentUserSessions: UserSessionDTO[];
}> => {
  const response = await makeMetadataAPIRequest(
    currentUserSessionsQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Current user sessions should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Current user sessions has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
