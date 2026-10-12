import { randomUUID } from 'crypto';

import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';

describe('Sign up in new workspace with a partner', () => {
  let email: string;
  let accessToken: string;
  let createdWorkspaceId: string | undefined;
  let ensureBillingCustomerSpy: jest.SpyInstance;

  beforeEach(async () => {
    email = `test-${randomUUID()}@example.com`;
    createdWorkspaceId = undefined;

    const { data } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    accessToken = data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const billingService =
      getAppProviderByClassName<BillingService>('BillingService');

    jest.spyOn(billingService, 'isBillingEnabled').mockReturnValue(true);

    ensureBillingCustomerSpy = jest
      .spyOn(billingService, 'ensureBillingCustomer')
      .mockResolvedValue();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    if (isDefined(createdWorkspaceId)) {
      await globalThis.testDataSource.query(
        'DELETE FROM core."workspace" WHERE id = $1',
        [createdWorkspaceId],
      );
    }

    await globalThis.testDataSource.query(
      'DELETE FROM core."user" WHERE email = $1',
      [email],
    );
  });

  it('should pass the partner to the billing customer creation', async () => {
    const { data } = await signUpInNewWorkspace({
      accessToken,
      partner: 'acme',
      expectToFail: false,
    });

    createdWorkspaceId = data.signUpInNewWorkspace.workspace.id;

    expect(ensureBillingCustomerSpy).toHaveBeenCalledWith({
      userEmail: email,
      workspaceId: createdWorkspaceId,
      workspaceDisplayName: 'Test Workspace',
      partner: 'acme',
    });
  });
});
