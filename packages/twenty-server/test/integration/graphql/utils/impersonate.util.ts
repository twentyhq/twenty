import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ImpersonateDTO } from 'src/engine/core-modules/admin-panel/dtos/impersonate.dto';

type ImpersonateUtilArgs = {
  userId: string;
  workspaceId: string;
  accessToken: string;
  expectToFail?: boolean;
};

export const impersonate = async ({
  userId,
  workspaceId,
  accessToken,
  expectToFail,
}: ImpersonateUtilArgs): CommonResponseBody<{
  impersonate: ImpersonateDTO;
}> => {
  const mutation = gql`
    mutation Impersonate($userId: UUID!, $workspaceId: UUID!) {
      impersonate(userId: $userId, workspaceId: $workspaceId) {
        loginToken {
          token
          expiresAt
        }
        workspace {
          id
          workspaceUrls {
            subdomainUrl
            customUrl
          }
        }
      }
    }
  `;

  const response = await makeMetadataAPIRequest(
    {
      query: mutation,
      variables: { userId, workspaceId },
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Impersonate should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Impersonate has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
