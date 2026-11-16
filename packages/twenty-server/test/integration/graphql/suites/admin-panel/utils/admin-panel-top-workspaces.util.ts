import { adminPanelTopWorkspacesQueryFactory } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-top-workspaces-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';

export const adminPanelTopWorkspaces = async ({
  token,
  expectToFail,
}: {
  token?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  adminPanelTopWorkspaces: Pick<AdminPanelTopWorkspaceDTO, 'id'>[];
}> => {
  const response = await makeAdminPanelApiRequest(
    adminPanelTopWorkspacesQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Admin panel top workspaces should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Admin panel top workspaces has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
