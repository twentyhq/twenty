import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type SignUpOutput } from 'src/engine/core-modules/auth/dto/sign-up.output';

type SignUpOnNewWorkspaceUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const signUpInNewWorkspace = async ({
  accessToken,
  expectToFail,
}: SignUpOnNewWorkspaceUtilArgs): CommonResponseBody<{
  signUpInNewWorkspace: SignUpOutput;
}> => {
  const mutation = gql`
    mutation SignUpInNewWorkspace {
      signUpInNewWorkspace {
        loginToken {
          token
          expiresAt
        }
        workspace {
          id
          workspaceUrls {
            customUrl
            subdomainUrl
          }
        }
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query: mutation,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Sign up on new workspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Sign up on new workspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
