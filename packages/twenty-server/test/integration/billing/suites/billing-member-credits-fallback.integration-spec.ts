import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { MemberCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-member-credits-fallback.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildUpdateMemberCreditsFallbackOperation = (
  memberCreditsFallback: MemberCreditsFallback,
) => ({
  query: gql`
    mutation UpdateMemberCreditsFallback(
      $memberCreditsFallback: MemberCreditsFallback!
    ) {
      updateMemberCreditsFallback(
        memberCreditsFallback: $memberCreditsFallback
      ) {
        id
        memberCreditsFallback
      }
    }
  `,
  variables: { memberCreditsFallback },
});

const CURRENT_WORKSPACE_MEMBER_CREDITS_FALLBACK_OPERATION = {
  query: gql`
    query CurrentWorkspaceMemberCreditsFallback {
      currentWorkspace {
        billingCustomer {
          id
          memberCreditsFallback
        }
      }
    }
  `,
};

const findStoredMemberCreditsFallback = async (): Promise<string> => {
  const [billingCustomer] = await globalThis.testDataSource.query(
    `SELECT "memberCreditsFallback" FROM core."billingCustomer" WHERE "workspaceId" = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return billingCustomer.memberCreditsFallback;
};

describe('billing member credits fallback', () => {
  afterAll(async () => {
    await makeMetadataApiRequest(
      buildUpdateMemberCreditsFallbackOperation(
        MemberCreditsFallback.WORKSPACE_CREDITS,
      ),
    );
  });

  it('should default to WORKSPACE_CREDITS', async () => {
    const response = await makeMetadataApiRequest(
      CURRENT_WORKSPACE_MEMBER_CREDITS_FALLBACK_OPERATION,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentWorkspace.billingCustomer.memberCreditsFallback,
    ).toBe(MemberCreditsFallback.WORKSPACE_CREDITS);
    expect(await findStoredMemberCreditsFallback()).toBe(
      MemberCreditsFallback.WORKSPACE_CREDITS,
    );
  });

  it('should let a member with the billing permission switch to STOP', async () => {
    const response = await makeMetadataApiRequest(
      buildUpdateMemberCreditsFallbackOperation(MemberCreditsFallback.STOP),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.updateMemberCreditsFallback.memberCreditsFallback,
    ).toBe(MemberCreditsFallback.STOP);
    expect(await findStoredMemberCreditsFallback()).toBe(
      MemberCreditsFallback.STOP,
    );

    const currentWorkspaceResponse = await makeMetadataApiRequest(
      CURRENT_WORKSPACE_MEMBER_CREDITS_FALLBACK_OPERATION,
    );

    expect(
      currentWorkspaceResponse.body.data.currentWorkspace.billingCustomer
        .memberCreditsFallback,
    ).toBe(MemberCreditsFallback.STOP);
  });

  it('should refuse a member without the billing permission and keep the stored value', async () => {
    const storedBeforeAttempt = await findStoredMemberCreditsFallback();

    const response = await makeMetadataApiRequest(
      buildUpdateMemberCreditsFallbackOperation(
        storedBeforeAttempt === MemberCreditsFallback.STOP
          ? MemberCreditsFallback.WORKSPACE_CREDITS
          : MemberCreditsFallback.STOP,
      ),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(await findStoredMemberCreditsFallback()).toBe(storedBeforeAttempt);
  });
});
