import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildUpdateUserCreditsFallbackOperation = (
  userCreditsFallback: UserCreditsFallback,
) => ({
  query: gql`
    mutation UpdateUserCreditsFallback(
      $userCreditsFallback: UserCreditsFallback!
    ) {
      updateUserCreditsFallback(userCreditsFallback: $userCreditsFallback) {
        id
        userCreditsFallback
      }
    }
  `,
  variables: { userCreditsFallback },
});

const CURRENT_WORKSPACE_USER_CREDITS_FALLBACK_OPERATION = {
  query: gql`
    query CurrentWorkspaceUserCreditsFallback {
      currentWorkspace {
        billingCustomer {
          id
          userCreditsFallback
        }
      }
    }
  `,
};

const findStoredUserCreditsFallback = async (): Promise<string> => {
  const [billingCustomer] = await globalThis.testDataSource.query(
    `SELECT "userCreditsFallback" FROM core."billingCustomer" WHERE "workspaceId" = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return billingCustomer.userCreditsFallback;
};

describe('billing user credits fallback', () => {
  afterAll(async () => {
    await makeMetadataApiRequest(
      buildUpdateUserCreditsFallbackOperation(
        UserCreditsFallback.WORKSPACE_CREDITS,
      ),
    );
  });

  it('should default to WORKSPACE_CREDITS', async () => {
    const response = await makeMetadataApiRequest(
      CURRENT_WORKSPACE_USER_CREDITS_FALLBACK_OPERATION,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentWorkspace.billingCustomer.userCreditsFallback,
    ).toBe(UserCreditsFallback.WORKSPACE_CREDITS);
    expect(await findStoredUserCreditsFallback()).toBe(
      UserCreditsFallback.WORKSPACE_CREDITS,
    );
  });

  it('should let a member with the billing permission switch to STOP', async () => {
    const response = await makeMetadataApiRequest(
      buildUpdateUserCreditsFallbackOperation(UserCreditsFallback.STOP),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.updateUserCreditsFallback.userCreditsFallback,
    ).toBe(UserCreditsFallback.STOP);
    expect(await findStoredUserCreditsFallback()).toBe(
      UserCreditsFallback.STOP,
    );

    const currentWorkspaceResponse = await makeMetadataApiRequest(
      CURRENT_WORKSPACE_USER_CREDITS_FALLBACK_OPERATION,
    );

    expect(
      currentWorkspaceResponse.body.data.currentWorkspace.billingCustomer
        .userCreditsFallback,
    ).toBe(UserCreditsFallback.STOP);
  });

  it('should refuse a member without the billing permission and keep the stored value', async () => {
    const storedBeforeAttempt = await findStoredUserCreditsFallback();

    const response = await makeMetadataApiRequest(
      buildUpdateUserCreditsFallbackOperation(
        storedBeforeAttempt === UserCreditsFallback.STOP
          ? UserCreditsFallback.WORKSPACE_CREDITS
          : UserCreditsFallback.STOP,
      ),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(await findStoredUserCreditsFallback()).toBe(storedBeforeAttempt);
  });
});
