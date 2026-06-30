import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

type ApplicationSyncPlan = {
  applicationUniversalIdentifier: string;
  hasDestructiveActions: boolean;
  summary: { destructiveCount: number };
  actions: Array<{ type: string; metadataName: string; severity: string }>;
};

export const planApplicationUpgrade = async ({
  appRegistrationId,
  targetVersion,
  token,
}: {
  appRegistrationId: string;
  targetVersion: string;
  token?: string;
}): CommonResponseBody<{
  planApplicationUpgrade: ApplicationSyncPlan;
}> => {
  const graphqlOperation = {
    query: gql`
      query PlanApplicationUpgrade(
        $appRegistrationId: String!
        $targetVersion: String!
      ) {
        planApplicationUpgrade(
          appRegistrationId: $appRegistrationId
          targetVersion: $targetVersion
        ) {
          applicationUniversalIdentifier
          hasDestructiveActions
          summary {
            destructiveCount
          }
          actions {
            type
            metadataName
            severity
          }
        }
      }
    `,
    variables: { appRegistrationId, targetVersion },
  };

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'Plan application upgrade has failed but should not',
  });

  return { data: response.body.data, errors: response.body.errors };
};
