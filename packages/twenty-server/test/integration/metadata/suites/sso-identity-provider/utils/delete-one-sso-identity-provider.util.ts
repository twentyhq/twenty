import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteSsoDTO } from 'src/engine/core-modules/sso/dtos/delete-sso.dto';

type DeleteOneSsoIdentityProviderArgs = {
  identityProviderId: string;
  expectToFail?: boolean;
  token?: string;
};

export const deleteOneSsoIdentityProvider = async ({
  identityProviderId,
  expectToFail = false,
  token,
}: DeleteOneSsoIdentityProviderArgs): CommonResponseBody<{
  deleteSSOIdentityProvider: DeleteSsoDTO;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation DeleteSSOIdentityProvider($input: DeleteSsoInput!) {
          deleteSSOIdentityProvider(input: $input) {
            identityProviderId
          }
        }
      `,
      variables: { input: { identityProviderId } },
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'SSO identity provider deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'SSO identity provider deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
