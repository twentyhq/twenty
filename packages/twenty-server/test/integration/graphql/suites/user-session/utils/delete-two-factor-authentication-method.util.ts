import {
  type DeleteTwoFactorAuthenticationMethodFactoryInput,
  deleteTwoFactorAuthenticationMethodQueryFactory,
} from 'test/integration/graphql/suites/user-session/utils/delete-two-factor-authentication-method-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteTwoFactorAuthenticationMethodDTO } from 'src/engine/core-modules/two-factor-authentication/dto/delete-two-factor-authentication-method.dto';

export const deleteTwoFactorAuthenticationMethod = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<DeleteTwoFactorAuthenticationMethodFactoryInput>): CommonResponseBody<{
  deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethodDTO;
}> => {
  const response = await makeMetadataApiRequest(
    deleteTwoFactorAuthenticationMethodQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Deleting a two-factor method should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Deleting a two-factor method has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
