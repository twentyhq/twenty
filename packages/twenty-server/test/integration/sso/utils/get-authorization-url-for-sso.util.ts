import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

import { type GetAuthorizationUrlForSsoDTO } from 'src/engine/core-modules/auth/dto/get-authorization-url-for-sso.dto';

export const getAuthorizationUrlForSso = async (
  identityProviderId: string,
): Promise<GetAuthorizationUrlForSsoDTO> => {
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
      variables: { input: { identityProviderId } },
    },
    null,
  );

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'SSO authorization URL query has failed but should not',
  });

  return response.body.data.getAuthorizationUrlForSSO;
};
