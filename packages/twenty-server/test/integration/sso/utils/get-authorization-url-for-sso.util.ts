import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type GetAuthorizationUrlForSsoDTO } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.dto';
import { type GetAuthorizationUrlForSsoInput } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.input';

export const getAuthorizationUrlForSso = async ({
  input,
  expectToFail = false,
}: {
  input: GetAuthorizationUrlForSsoInput;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getAuthorizationUrlForSSO: GetAuthorizationUrlForSsoDTO;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation GetAuthorizationUrlForSSO(
          $input: GetAuthorizationUrlForSSOInput!
        ) {
          getAuthorizationUrlForSSO(input: $input) {
            id
            type
            authorizationURL
          }
        }
      `,
      variables: { input },
    },
    null,
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'SSO authorization URL query should have failed but did not',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'SSO authorization URL query has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
