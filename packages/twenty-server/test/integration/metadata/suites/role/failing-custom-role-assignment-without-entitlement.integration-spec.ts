import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type WorkspaceBillingEntitlementsCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-entitlements-cache.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Custom role assignment without the custom roles entitlement', () => {
  let workspaceCacheService: WorkspaceCacheService;
  let billingEntitlementsCacheService: WorkspaceBillingEntitlementsCacheService;
  let adminRoleId: string;
  let memberRoleId: string;
  let guestRoleId: string;
  let customRoleId: string;

  const refreshEntitlements = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'billingEntitlements',
    ]);

  beforeAll(async () => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    billingEntitlementsCacheService =
      getAppProviderByClassName<WorkspaceBillingEntitlementsCacheService>(
        'WorkspaceBillingEntitlementsCacheService',
      );

    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    guestRoleId = (await findOneRoleByLabel({ label: 'Guest' })).id;

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Entitlement gated role',
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: true,
      },
    });

    customRoleId = data.createOneRole.id;

    jest
      .spyOn(billingEntitlementsCacheService, 'computeForCache')
      .mockReturnValue({ [BillingEntitlementKey.CUSTOM_ROLES]: false });
    await refreshEntitlements();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await refreshEntitlements();

    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: memberRoleId,
      },
    });

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: customRoleId },
    });
  });

  it('should refuse assigning a custom role to a workspace member', async () => {
    const { errors } = await updateWorkspaceMemberRole({
      expectToFail: true,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: customRoleId,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  describe('when a new user joins with a custom role', () => {
    let userWorkspaceService: UserWorkspaceService;
    let workspace: WorkspaceEntity;
    let user: UserEntity;

    beforeAll(async () => {
      userWorkspaceService = getAppProviderByClassName<UserWorkspaceService>(
        'UserWorkspaceService',
      );

      [workspace] = await global.testDataSource.query(
        `SELECT * FROM core."workspace" WHERE id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

      [user] = await global.testDataSource.query(
        `INSERT INTO core."user" (email, "firstName", "lastName") VALUES ($1, 'Unentitled', 'Joiner') RETURNING *`,
        ['unentitled-joiner@apple.dev'],
      );
    });

    afterAll(async () => {
      await global.testDataSource.query(
        `DELETE FROM core."userWorkspace" WHERE "userId" = $1`,
        [user.id],
      );
      await global.testDataSource.query(
        `DELETE FROM core."user" WHERE id = $1`,
        [user.id],
      );
    });

    it.each([
      { roleSource: 'the invited role', isDefaultRole: false },
      { roleSource: 'the workspace default role', isDefaultRole: true },
    ])(
      'should refuse $roleSource before saving the membership',
      async ({ isDefaultRole }) => {
        await expect(
          userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
            user,
            isDefaultRole
              ? { ...workspace, defaultRoleId: customRoleId }
              : workspace,
            isDefaultRole ? undefined : customRoleId,
          ),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
        });

        const userWorkspaces = await global.testDataSource.query(
          `SELECT id FROM core."userWorkspace" WHERE "userId" = $1`,
          [user.id],
        );

        expect(userWorkspaces).toEqual([]);
      },
    );
  });

  it('should refuse creating an API key with a custom role', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: 'Entitlement gated key',
          expiresAt: '2099-01-01T00:00:00Z',
          roleId: customRoleId,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('should refuse a custom role as the workspace default role', async () => {
    const { errors } = await updateWorkspace({
      expectToFail: true,
      data: { defaultRoleId: customRoleId },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a role that cannot be assigned to users as the workspace default role', async () => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Agent only role',
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
      },
    });

    const { errors } = await updateWorkspace({
      expectToFail: true,
      data: { defaultRoleId: data.createOneRole.id },
    });

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: data.createOneRole.id },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should still create an agent with a custom role', async () => {
    const { data, errors } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Entitlement exempt agent',
        prompt: 'Answer questions',
        modelId: TEST_AI_MODEL_ID,
        roleId: customRoleId,
      },
    });

    expect(errors).toBeUndefined();

    await deleteOneAgent({
      expectToFail: false,
      input: { id: data.createOneAgent.id },
    });
  });

  it('should still assign Admin and Member', async () => {
    const { errors: adminErrors } = await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: adminRoleId,
      },
    });

    expect(adminErrors).toBeUndefined();

    const { errors: memberErrors } = await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: memberRoleId,
      },
    });

    expect(memberErrors).toBeUndefined();
  });

  it('should keep a member on their existing custom role when it is saved again', async () => {
    const { errors } = await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        roleId: guestRoleId,
      },
    });

    expect(errors).toBeUndefined();

    const roleTargets: { roleId: string }[] = await global.testDataSource.query(
      `SELECT "roleId" FROM core."roleTarget" WHERE "workspaceId" = $1 AND "userWorkspaceId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, USER_WORKSPACE_DATA_SEED_IDS.PHIL],
    );

    expect(roleTargets).toEqual([{ roleId: guestRoleId }]);
  });
});
