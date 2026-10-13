import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { MemberCreditsFallback } from 'src/engine/core-modules/workspace/types/member-credits-fallback.type';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildUpdateMemberCreditsFallbackOperation = (
  memberCreditsFallback: MemberCreditsFallback,
) => ({
  query: gql`
    mutation UpdateWorkspaceMemberCreditsFallback(
      $data: UpdateWorkspaceInput!
    ) {
      updateWorkspace(data: $data) {
        id
        memberCreditsFallback
      }
    }
  `,
  variables: { data: { memberCreditsFallback } },
});

const CURRENT_WORKSPACE_MEMBER_CREDITS_FALLBACK_OPERATION = {
  query: gql`
    query CurrentWorkspaceMemberCreditsFallback {
      currentWorkspace {
        memberCreditsFallback
      }
    }
  `,
};

const findStoredMemberCreditsFallback = async (): Promise<string> => {
  const [workspace] = await globalThis.testDataSource.query(
    `SELECT "memberCreditsFallback" FROM core."workspace" WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspace.memberCreditsFallback;
};

describe('workspace member credits fallback', () => {
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
    expect(response.body.data.currentWorkspace.memberCreditsFallback).toBe(
      MemberCreditsFallback.WORKSPACE_CREDITS,
    );
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
    expect(response.body.data.updateWorkspace.memberCreditsFallback).toBe(
      MemberCreditsFallback.STOP,
    );
    expect(await findStoredMemberCreditsFallback()).toBe(
      MemberCreditsFallback.STOP,
    );

    const currentWorkspaceResponse = await makeMetadataApiRequest(
      CURRENT_WORKSPACE_MEMBER_CREDITS_FALLBACK_OPERATION,
    );

    expect(
      currentWorkspaceResponse.body.data.currentWorkspace.memberCreditsFallback,
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
