import gql from 'graphql-tag';
import { makeAdminPanelApiRequestAsNonServerAdmin } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-as-non-server-admin.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type AdminApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-monitoring.dto';

export const findAdminApplicationRegistrationMonitoring = async ({
  id,
  workspaceId,
  expectToFail = false,
  asNonServerAdmin = false,
}: {
  id: string;
  workspaceId?: string;
  expectToFail?: boolean;
  asNonServerAdmin?: boolean;
}): CommonResponseBody<{
  findAdminApplicationRegistrationMonitoring: AdminApplicationMonitoringDTO;
}> => {
  const graphqlOperation = {
    query: gql`
      query FindAdminApplicationRegistrationMonitoring(
        $id: String!
        $workspaceId: String
      ) {
        findAdminApplicationRegistrationMonitoring(
          id: $id
          workspaceId: $workspaceId
        ) {
          runCount
          failedRunCount
          activeWorkspaceCount
          workspaces {
            workspaceId
            workspaceName
            workspaceLogoUrl
            applicationVersion
            runCount
            failedRunCount
            rateLimitEventCount
            lastEventAt
          }
        }
      }
    `,
    variables: { id, workspaceId },
  };

  const response = asNonServerAdmin
    ? await makeAdminPanelApiRequestAsNonServerAdmin(graphqlOperation)
    : await makeAdminPanelApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding admin application registration monitoring should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding admin application registration monitoring has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
