import { adminPanelRecentUsersQueryFactory } from 'test/integration/graphql/suites/admin-panel/utils/admin-panel-recent-users-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';

export const adminPanelRecentUsers = async ({
  token,
  expectToFail,
}: {
  token?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  adminPanelRecentUsers: Pick<AdminPanelRecentUserDTO, 'workspaceId'>[];
}> => {
  const response = await makeAdminPanelApiRequest(
    adminPanelRecentUsersQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Admin panel recent users should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Admin panel recent users has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
