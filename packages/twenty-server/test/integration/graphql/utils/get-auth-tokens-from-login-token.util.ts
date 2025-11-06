import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';

type GetAuthTokensFromLoginTokenUtilArgs = {
  loginToken: string;
  origin?: string;
  expectToFail?: boolean;
};

export const getAuthTokensFromLoginToken = async ({
  loginToken,
  origin = 'http://localhost:3001',
  expectToFail,
}: GetAuthTokensFromLoginTokenUtilArgs): CommonResponseBody<{
  getAuthTokensFromLoginToken: AuthTokens;
}> => {
  const mutation = gql`
    mutation GetAuthTokensFromLoginToken(
      $loginToken: String!
      $origin: String!
    ) {
      getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
        tokens {
          accessOrWorkspaceAgnosticToken {
            token
            expiresAt
          }
          refreshToken {
            token
            expiresAt
          }
        }
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query: mutation,
      variables: {
        loginToken,
        origin,
      },
    },
    undefined, // Public endpoint - no authentication required
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Get auth tokens from login token should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Get auth tokens from login token has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
