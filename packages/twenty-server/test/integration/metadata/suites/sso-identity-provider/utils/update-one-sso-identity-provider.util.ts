import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type EditSsoDTO } from 'src/engine/core-modules/sso/dtos/edit-sso.dto';
import { type EditSsoInput } from 'src/engine/core-modules/sso/dtos/edit-sso.input';

export const updateOneSsoIdentityProvider = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<EditSsoInput>): CommonResponseBody<{
  editSSOIdentityProvider: EditSsoDTO;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation EditSSOIdentityProvider($input: EditSsoInput!) {
          editSSOIdentityProvider(input: $input) {
            id
            type
            issuer
            name
            status
          }
        }
      `,
      variables: { input },
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'SSO identity provider update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'SSO identity provider update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
