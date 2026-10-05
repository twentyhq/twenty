import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import {
  APPLICATION_ONLY_REST_REQUEST_FACTORIES,
  makeApplicationOnlyRestRequest,
} from 'test/integration/metadata/suites/application/utils/application-only-endpoint-request-factories.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { CREDIT_UNAVAILABLE_REASONS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

describe('AppBillingController (integration)', () => {
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

  it('tells the calling application whether credits are available', async () => {
    const response = await makeApplicationOnlyRestRequest(
      APPLICATION_ONLY_REST_REQUEST_FACTORIES['GET /app/billing/credits'](),
      applicationToken,
    );

    expect(response.status).toBe(200);
    expect(
      response.body.hasAvailableCredits === true ||
        CREDIT_UNAVAILABLE_REASONS.includes(response.body.reason),
    ).toBe(true);
  });

  it('records a charge for the calling application', async () => {
    const emitChargeEventSpy = jest.spyOn(
      getAppProviderByClassName<AppBillingService>('AppBillingService'),
      'emitChargeEvent',
    );

    try {
      const response = await makeApplicationOnlyRestRequest(
        APPLICATION_ONLY_REST_REQUEST_FACTORIES['POST /app/billing/charge'](),
        applicationToken,
      );

      expect(response.status).toBe(204);
      expect(emitChargeEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId,
        }),
      );
    } finally {
      emitChargeEventSpy.mockRestore();
    }
  });
});
