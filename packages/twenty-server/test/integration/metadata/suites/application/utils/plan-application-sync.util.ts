import { type Manifest } from 'twenty-shared/application';
import { planApplicationSyncQueryFactory } from 'test/integration/metadata/suites/application/utils/plan-application-sync-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

type ApplicationSyncPlanAction = {
  type: string;
  metadataName: string;
  universalIdentifier: string | null;
  label: string | null;
  severity: string;
  affectedRowCount: number | null;
};

type ApplicationSyncPlan = {
  applicationUniversalIdentifier: string;
  isEmpty: boolean;
  hasDestructiveActions: boolean;
  currentVersion: string | null;
  proposedVersion: string;
  summary: {
    createCount: number;
    updateCount: number;
    deleteCount: number;
    breakingCount: number;
    destructiveCount: number;
    totalAffectedRows: number;
  };
  actions: ApplicationSyncPlanAction[];
};

export const planApplicationSync = async ({
  manifest,
  token,
}: {
  manifest: Manifest;
  token?: string;
}): CommonResponseBody<{
  planApplicationSync: ApplicationSyncPlan;
}> => {
  const graphqlOperation = planApplicationSyncQueryFactory({ manifest });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'Plan application sync has failed but should not',
  });

  return { data: response.body.data, errors: response.body.errors };
};
