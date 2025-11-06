import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type DeleteCurrentWorkspaceUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const deleteCurrentWorkspace = async ({
  accessToken,
  expectToFail,
}: DeleteCurrentWorkspaceUtilArgs): CommonResponseBody<{
  deleteCurrentWorkspace: WorkspaceEntity;
}> => {
  const mutation = gql`
    mutation DeleteCurrentWorkspace {
      deleteCurrentWorkspace {
        id
        displayName
        subdomain
        activationStatus
        deletedAt
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
      errorMessage: 'Delete current workspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Delete current workspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
