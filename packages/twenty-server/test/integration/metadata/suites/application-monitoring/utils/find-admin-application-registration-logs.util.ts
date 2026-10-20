import gql from 'graphql-tag';
import { makeAdminPanelApiRequestAsNonServerAdmin } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-as-non-server-admin.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type AdminApplicationLogsInput } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-logs.input';
import { type EventLogQueryResult } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';

export const findAdminApplicationRegistrationLogs = async ({
  input,
  expectToFail = false,
  asNonServerAdmin = false,
}: {
  input: AdminApplicationLogsInput;
  expectToFail?: boolean;
  asNonServerAdmin?: boolean;
}): CommonResponseBody<{
  findAdminApplicationRegistrationLogs: EventLogQueryResult;
}> => {
  const graphqlOperation = {
    query: gql`
      query FindAdminApplicationRegistrationLogs(
        $input: AdminApplicationLogsInput!
      ) {
        findAdminApplicationRegistrationLogs(input: $input) {
          records {
            event
            timestamp
            properties
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `,
    variables: { input },
  };

  const response = asNonServerAdmin
    ? await makeAdminPanelApiRequestAsNonServerAdmin(graphqlOperation)
    : await makeAdminPanelApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding admin application registration logs should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding admin application registration logs has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
