import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import {
  APPLICATION_ONLY_REST_REQUEST_FACTORIES,
  makeApplicationOnlyRestRequest,
} from 'test/integration/metadata/suites/application/utils/application-only-endpoint-request-factories.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const CREDIT_LIMIT_MICRO = 1_000;

describe('App credit availability', () => {
  let applicationId: string;
  let applicationToken: string;

  beforeAll(async () => {
    const { data } = await findManyApplications({ expectToFail: false });

    const standardApplication = data.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    if (!isDefined(standardApplication)) {
      throw new Error('The standard application is not installed');
    }

    applicationId = standardApplication.id;

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
  });

  it('refuses credits once an all-usage limit on the application is exhausted', async () => {
    const usageLimitService =
      getAppProviderByClassName<UsageLimitService>('UsageLimitService');

    const usageLimit = await usageLimitService.create({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      input: {
        resourceType: UsageResourceType.ALL,
        operationType: UsageOperationType.ALL,
        spenderType: 'application',
        spenderId: applicationId,
        limitKind: 'quota',
        periodCount: 1,
        periodUnit: 'month',
        unit: UsageUnit.CREDIT,
        limitValue: CREDIT_LIMIT_MICRO,
        burstValue: null,
      },
      isOperator: true,
    });

    try {
      await getAppProviderByClassName<UsageLimitQuotaService>(
        'UsageLimitQuotaService',
      ).debitAheadOfRecord({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        event: {
          resourceType: UsageResourceType.APP,
          operationType: UsageOperationType.CALL_RECORDING,
          creditsUsedMicro: CREDIT_LIMIT_MICRO,
          quantity: 1,
          unit: UsageUnit.MINUTE,
          resourceId: applicationId,
          spenders: { applicationId },
        },
      });

      const response = await makeApplicationOnlyRestRequest(
        APPLICATION_ONLY_REST_REQUEST_FACTORIES['GET /app/billing/credits'](),
        applicationToken,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        hasAvailableCredits: false,
        reason: 'no-credits',
      });
    } finally {
      await usageLimitService.delete({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        usageLimitId: usageLimit.id,
        isOperator: true,
      });
    }
  });
});
