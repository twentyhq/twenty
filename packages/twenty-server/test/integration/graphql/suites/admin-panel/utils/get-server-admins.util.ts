import { getServerAdminsQueryFactory } from 'test/integration/graphql/suites/admin-panel/utils/get-server-admins-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type ServerAdminDTO } from 'src/engine/core-modules/admin-panel/dtos/server-admin.dto';

export const getServerAdmins = async ({
  token,
  expectToFail,
}: {
  token?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getServerAdmins: Pick<ServerAdminDTO, 'id'>[];
}> => {
  const response = await makeAdminPanelApiRequest(
    getServerAdminsQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Get server admins should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Get server admins has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
