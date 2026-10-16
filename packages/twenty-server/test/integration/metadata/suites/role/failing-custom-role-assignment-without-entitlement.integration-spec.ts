import gql from 'graphql-tag';
import { TEST_STRIPE_CUSTOMER_ID } from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type ValidationGraphqlError = {
  extensions?: {
    errors?: Record<string, { errors: { code: string }[] }[]>;
  };
};

const getValidationErrorCodes = (
  errors: ValidationGraphqlError[] | undefined,
): string[] =>
  (errors ?? []).flatMap((error) =>
    Object.values(error.extensions?.errors ?? {})
      .flat()
      .flatMap((failedEntity) => failedEntity.errors.map(({ code }) => code)),
  );

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';

(isBillingEnabled ? describe : describe.skip)(
  'Custom role assignment without the custom roles entitlement',
  () => {
    let workspaceCacheService: WorkspaceCacheService;
    let adminRoleId: string;
    let memberRoleId: string;
    let guestRoleId: string;
    let customRoleId: string;

    const setCustomRolesEntitlement = async (value: boolean) => {
      await global.testDataSource.query(
        `INSERT INTO core."billingEntitlement" ("workspaceId", key, value, "stripeCustomerId")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("workspaceId", key) DO UPDATE SET value = EXCLUDED.value`,
        [
          SEED_APPLE_WORKSPACE_ID,
          BillingEntitlementKey.CUSTOM_ROLES,
          value,
          TEST_STRIPE_CUSTOMER_ID,
        ],
      );

      await workspaceCacheService.invalidateAndRecompute(
        SEED_APPLE_WORKSPACE_ID,
        ['billingEntitlements'],
      );
    };

    beforeAll(async () => {
      workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
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

      await setCustomRolesEntitlement(false);
    });

    afterAll(async () => {
      await setCustomRolesEntitlement(true);

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

      expect(getValidationErrorCodes(errors)).toContain(
        RoleTargetExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
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

      expect(getValidationErrorCodes(response.body.errors)).toContain(
        RoleTargetExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
      );
    });

    it('should refuse creating an agent with a custom role', async () => {
      const { errors } = await createOneAgent({
        expectToFail: true,
        input: {
          label: 'Entitlement gated agent',
          prompt: 'Answer questions',
          modelId: TEST_AI_MODEL_ID,
          roleId: customRoleId,
        },
      });

      expect(getValidationErrorCodes(errors)).toContain(
        RoleTargetExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
      );
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

    it('should keep existing custom role assignments', async () => {
      const roleTargets: { roleId: string }[] =
        await global.testDataSource.query(
          `SELECT "roleId" FROM core."roleTarget" WHERE "workspaceId" = $1 AND "userWorkspaceId" = $2`,
          [SEED_APPLE_WORKSPACE_ID, USER_WORKSPACE_DATA_SEED_IDS.PHIL],
        );

      expect(roleTargets).toEqual([{ roleId: guestRoleId }]);
    });
  },
);
