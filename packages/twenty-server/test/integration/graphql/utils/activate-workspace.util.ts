import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type ActivateWorkspaceUtilArgs = {
  accessToken: string;
  displayName: string;
  expectToFail?: boolean;
};

export const activateWorkspace = async ({
  accessToken,
  displayName,
  expectToFail,
}: ActivateWorkspaceUtilArgs): CommonResponseBody<{
  activateWorkspace: WorkspaceEntity;
}> => {
  const mutation = gql`
    mutation ActivateWorkspace($input: ActivateWorkspaceInput!) {
      activateWorkspace(data: $input) {
        id
        displayName
        activationStatus
        subdomain
        inviteHash
        logo
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query: mutation,
      variables: {
        input: {
          displayName,
        },
      },
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Activate workspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Activate workspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
