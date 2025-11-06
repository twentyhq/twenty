import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type AvailableWorkspacesAndAccessTokensOutput } from 'src/engine/core-modules/auth/dto/available-workspaces-and-access-tokens.output';
import { type UserCredentialsInput } from 'src/engine/core-modules/auth/dto/user-credentials.input';

type SignUpUtilArgs = {
  input: UserCredentialsInput;
  expectToFail?: boolean;
};

export const signUp = async ({
  input,
  expectToFail,
}: SignUpUtilArgs): CommonResponseBody<{
  signUp: AvailableWorkspacesAndAccessTokensOutput;
}> => {
  const mutation = gql`
    mutation SignUp(
      $email: String!
      $password: String!
      $captchaToken: String
    ) {
      signUp(email: $email, password: $password, captchaToken: $captchaToken) {
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
        availableWorkspaces {
          availableWorkspacesForSignIn {
            id
            displayName
            logo
            workspaceUrls {
              customUrl
              subdomainUrl
            }
          }
          availableWorkspacesForSignUp {
            id
            displayName
            logo
            workspaceUrls {
              customUrl
              subdomainUrl
            }
          }
        }
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query: mutation,
      variables: {
        ...input,
      },
    },
    undefined, // Public endpoint - no authentication required
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Sign up should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Sign up has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
