import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

import { type FindAvailableSsoIdpDTO } from 'src/engine/core-modules/sso/dtos/find-available-sso-idp.dto';

export const findSsoIdentityProviders = async ({
  token,
}: { token?: string } = {}): CommonResponseBody<{
  getSSOIdentityProviders: Omit<FindAvailableSsoIdpDTO, 'workspace'>[];
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query GetSSOIdentityProviders {
          getSSOIdentityProviders {
            id
            type
            issuer
            name
            status
          }
        }
      `,
    },
    token,
  );

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'SSO identity provider listing has failed but should not',
  });

  return { data: response.body.data, errors: response.body.errors };
};
