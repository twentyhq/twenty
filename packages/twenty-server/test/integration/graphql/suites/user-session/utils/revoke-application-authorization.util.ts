import {
  type RevokeApplicationAuthorizationFactoryInput,
  revokeApplicationAuthorizationQueryFactory,
} from 'test/integration/graphql/suites/user-session/utils/revoke-application-authorization-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const revokeApplicationAuthorization = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<RevokeApplicationAuthorizationFactoryInput>): CommonResponseBody<{
  revokeApplicationAuthorization: boolean;
}> => {
  const response = await makeMetadataApiRequest(
    revokeApplicationAuthorizationQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Revoking an application authorization should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Revoking an application authorization has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
