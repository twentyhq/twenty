import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type ImpersonateDTO } from 'src/engine/core-modules/admin-panel/dtos/impersonate.dto';

type ImpersonateFromAdminPanelUtilArgs = {
  userId: string;
  workspaceId: string;
  accessToken: string;
  expectToFail?: boolean;
};

export const impersonateFromAdminPanel = async ({
  userId,
  workspaceId,
  accessToken,
  expectToFail,
}: ImpersonateFromAdminPanelUtilArgs): CommonResponseBody<{
  impersonateFromAdminPanel: ImpersonateDTO;
}> => {
  const mutation = gql`
    mutation ImpersonateFromAdminPanel($userId: UUID!, $workspaceId: UUID!) {
      impersonateFromAdminPanel(userId: $userId, workspaceId: $workspaceId) {
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

  const response = await makeAdminPanelApiRequest(
    {
      query: mutation,
      variables: { userId, workspaceId },
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Impersonate from admin panel should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Impersonate from admin panel has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
