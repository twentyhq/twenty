import { currentUserQueryFactory } from 'test/integration/graphql/suites/user-session/utils/current-user-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const currentUser = async ({
  gqlFields,
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  currentUser: UserEntity;
}> => {
  const response = await makeMetadataAPIRequest(
    currentUserQueryFactory({ gqlFields }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Current user should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Current user has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
