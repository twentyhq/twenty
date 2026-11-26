import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import {
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import {
  createWebhook,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795704446558-move-marketplace-application-role-holders-to-cloned-roles.command';
import { type HandOverMarketplaceApplicationStandaloneRolesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795704446559-hand-over-marketplace-application-standalone-roles.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.setTimeout(240000);

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const REQUESTED_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const AGENT_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const STANDALONE_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const AGENT_UNIVERSAL_IDENTIFIER = uuidv4();
const COMPANY = STANDARD_OBJECTS.company;

const ROLE_CACHE_KEYS = [
  'flatRoleMaps',
  'flatRoleTargetMaps',
  'flatObjectPermissionMaps',
  'flatFieldPermissionMaps',
  'flatRolePermissionFlagMaps',
  'flatRowLevelPermissionRuleMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
  'flatRowLevelPermissionPredicateMaps',
  'rolesPermissions',
] as const;

const buildManifest = ({
  withStandaloneRole,
}: {
  withStandaloneRole: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      roles: [
        {
          universalIdentifier: REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Role backfill requested role',
          objectPermissions: [
            {
              objectUniversalIdentifier: COMPANY.universalIdentifier,
              canReadObjectRecords: true,
            },
          ],
        },
        {
          universalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Role backfill agent role',
          canBeAssignedToAgents: true,
          canReadAllObjectRecords: true,
        },
        ...(withStandaloneRole
          ? [
              {
                universalIdentifier: STANDALONE_ROLE_UNIVERSAL_IDENTIFIER,
                label: 'Role backfill standalone role',
                canBeAssignedToUsers: false,
                canBeAssignedToApiKeys: false,
                canBeAssignedToAgents: true,
              },
            ]
          : []),
      ],
      agents: [
        {
          universalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
          name: 'role-backfill-agent',
          label: 'Role backfill agent',
          prompt: 'You are a test agent.',
          roleUniversalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
        },
      ],
    },
  });

const query = <TRow = Record<string, unknown>>(
  sql: string,
  parameters: unknown[] = [],
): Promise<TRow[]> => globalThis.testDataSource.query(sql, parameters);

const findRoleByUniversalIdentifier = async (universalIdentifier: string) => {
  const [role] = await query<{
    id: string;
    label: string;
    applicationId: string;
    canBeAssignedToUsers: boolean;
    canBeAssignedToApiKeys: boolean;
    canBeAssignedToAgents: boolean;
  }>(
    `SELECT id, label, "applicationId", "canBeAssignedToUsers", "canBeAssignedToApiKeys", "canBeAssignedToAgents"
     FROM core."role" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [WORKSPACE_ID, universalIdentifier],
  );

  return role;
};

const findMetadataId = async (
  tableName: 'objectMetadata' | 'fieldMetadata',
  universalIdentifier: string,
) => {
  const [row] = await query<{ id: string }>(
    `SELECT id FROM core."${tableName}" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [WORKSPACE_ID, universalIdentifier],
  );

  return row.id;
};

// What 4a now refuses: rules, predicates and field permissions on a marketplace app role
const insertRestrictions = async ({
  roleId,
  applicationId,
}: {
  roleId: string;
  applicationId: string;
}) => {
  const companyId = await findMetadataId(
    'objectMetadata',
    COMPANY.universalIdentifier,
  );
  const companyNameId = await findMetadataId(
    'fieldMetadata',
    COMPANY.fields.name.universalIdentifier,
  );
  const ruleId = uuidv4();
  const groupId = uuidv4();
  const owner = [WORKSPACE_ID, applicationId, roleId, companyId];

  await query(
    `INSERT INTO core."fieldPermission" (id, "universalIdentifier", "workspaceId", "applicationId", "roleId", "objectMetadataId", "fieldMetadataId", "canUpdateFieldValue")
     VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
    [uuidv4(), uuidv4(), ...owner, companyNameId],
  );
  await query(
    `INSERT INTO core."rowLevelPermissionRule" (id, "universalIdentifier", "workspaceId", "applicationId", "roleId", "objectMetadataId", "canReadRecords", "canUpdateRecords")
     VALUES ($1, $2, $3, $4, $5, $6, true, true)`,
    [ruleId, uuidv4(), ...owner],
  );
  await query(
    `INSERT INTO core."rowLevelPermissionPredicateGroup" (id, "universalIdentifier", "workspaceId", "applicationId", "roleId", "objectMetadataId", "rowLevelPermissionRuleId", "logicalOperator")
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'AND')`,
    [groupId, uuidv4(), ...owner, ruleId],
  );
  await query(
    `INSERT INTO core."rowLevelPermissionPredicate" (id, "universalIdentifier", "workspaceId", "applicationId", "roleId", "objectMetadataId", "fieldMetadataId", operand, value, "rowLevelPermissionPredicateGroupId", "rowLevelPermissionRuleId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONTAINS', '"Acme"', $8, $9)`,
    [uuidv4(), uuidv4(), ...owner, companyNameId, groupId, ruleId],
  );
};

const createApiKey = async (roleId: string): Promise<string> => {
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
        name: `Role backfill ${randomUUID()}`,
        expiresAt: '2099-12-31T23:59:59Z',
        roleId,
      },
    },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createApiKey.id;
};

const findRoleTargetRoleIds = async () =>
  query<{ id: string; roleId: string }>(
    `SELECT id, "roleId" FROM core."roleTarget" WHERE "workspaceId" = $1 ORDER BY id`,
    [WORKSPACE_ID],
  );

const countRestrictions = async (roleId: string) => {
  const [counts] = await query<Record<string, number>>(
    `SELECT
       (SELECT count(*)::int FROM core."rowLevelPermissionRule" WHERE "roleId" = $1) AS rules,
       (SELECT count(*)::int FROM core."rowLevelPermissionPredicateGroup" WHERE "roleId" = $1) AS groups,
       (SELECT count(*)::int FROM core."rowLevelPermissionPredicate" WHERE "roleId" = $1) AS predicates,
       (SELECT count(*)::int FROM core."fieldPermission" WHERE "roleId" = $1) AS "fieldPermissions"`,
    [roleId],
  );

  return counts;
};

const findRuleGrants = (roleId: string) =>
  query(
    `SELECT "objectMetadataId", "canReadRecords", "canCreateRecords", "canUpdateRecords", "canSoftDeleteRecords", "canDestroyRecords"
     FROM core."rowLevelPermissionRule" WHERE "roleId" = $1 ORDER BY "objectMetadataId"`,
    [roleId],
  );

const findWorkspaceDefaultRoleId = async () => {
  const [workspace] = await query<{ defaultRoleId: string }>(
    `SELECT "defaultRoleId" FROM core."workspace" WHERE id = $1`,
    [WORKSPACE_ID],
  );

  return workspace.defaultRoleId;
};

const findRoleRowsOwnedBy = (applicationId: string) =>
  query(
    `SELECT * FROM core."role" WHERE "workspaceId" = $1 AND "applicationId" = $2 ORDER BY id`,
    [WORKSPACE_ID, applicationId],
  );

const ID_KEYS = new Set([
  'id',
  'roleId',
  'universalIdentifier',
  'rowLevelPermissionPredicateGroupId',
  'parentRowLevelPermissionPredicateGroupId',
  'rowLevelPermissionRuleId',
  'ruleId',
  'applicationId',
  'workspaceId',
  'createdAt',
  'updatedAt',
  'deletedAt',
]);

const withoutIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(withoutIds);
  }

  if (isDefined(value) && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !ID_KEYS.has(key))
        .map(([key, entry]) => [key, withoutIds(entry)]),
    );
  }

  return value;
};

describe('2-65 workspace commands - marketplace application roles (integration)', () => {
  const workspaceCacheService = () =>
    getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');

  let applicationId: string;
  let workspaceCustomApplicationId: string;
  let roleIds: { requested: string; agent: string; standalone: string };
  let initialRoleIds: Record<
    'workspaceDefault' | 'jony' | 'phil' | 'tim',
    string
  >;
  let apiKeyIds: string[] = [];
  const webhookIds: string[] = [];
  let computedPermissionsBefore: Record<string, unknown>;
  let restrictionSnapshotsBefore: Record<string, unknown>;

  const runCommands = async (options: { dryRun?: boolean } = {}) => {
    for (const className of [
      'MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand',
      'HandOverMarketplaceApplicationStandaloneRolesCommand',
    ]) {
      await getAppProviderByClassName<
        | MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand
        | HandOverMarketplaceApplicationStandaloneRolesCommand
      >(className).runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        options,
        index: 0,
        total: 1,
        dataSource: global.testDataSource,
      });
    }
  };

  const findCloneRole = (originalLabel: string) =>
    query<{
      id: string;
      applicationId: string;
      canBeAssignedToUsers: boolean;
      canBeAssignedToApiKeys: boolean;
    }>(
      `SELECT id, "applicationId", "canBeAssignedToUsers", "canBeAssignedToApiKeys"
       FROM core."role" WHERE "workspaceId" = $1 AND label = $2`,
      [WORKSPACE_ID, `${originalLabel} copy`],
    ).then(([role]) => role);

  const findRoleOfUserWorkspace = async (userWorkspaceId: string) => {
    const [roleTarget] = await query<{ roleId: string }>(
      `SELECT "roleTarget"."roleId" FROM core."roleTarget" AS "roleTarget"
       JOIN core."role" AS role ON role.id = "roleTarget"."roleId"
       WHERE "roleTarget"."userWorkspaceId" = $1 AND NOT role."isSystemSideEffect"`,
      [userWorkspaceId],
    );

    return roleTarget?.roleId;
  };

  const snapshotRestrictions = async (roleId: string) => ({
    ...(await findRolePermissionSnapshot(roleId)),
    rules: await findRuleGrants(roleId),
  });

  beforeAll(async () => {
    jest.useRealTimers();

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Role Backfill',
      description: 'App for testing the marketplace application role backfill',
      sourcePath: 'test-marketplace-application-role-backfill',
    });

    const { errors } = await syncApplication({
      manifest: buildManifest({ withStandaloneRole: true }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    applicationId = (await findApplicationIdByUniversalIdentifier({
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    }))!;
    workspaceCustomApplicationId = await findWorkspaceCustomApplicationId();

    roleIds = {
      requested: (await findRoleByUniversalIdentifier(
        REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
      ))!.id,
      agent: (await findRoleByUniversalIdentifier(
        AGENT_ROLE_UNIVERSAL_IDENTIFIER,
      ))!.id,
      standalone: (await findRoleByUniversalIdentifier(
        STANDALONE_ROLE_UNIVERSAL_IDENTIFIER,
      ))!.id,
    };

    initialRoleIds = {
      workspaceDefault: await findWorkspaceDefaultRoleId(),
      jony: (await findRoleOfUserWorkspace(USER_WORKSPACE_DATA_SEED_IDS.JONY))!,
      phil: (await findRoleOfUserWorkspace(USER_WORKSPACE_DATA_SEED_IDS.PHIL))!,
      tim: (await findRoleOfUserWorkspace(USER_WORKSPACE_DATA_SEED_IDS.TIM))!,
    };

    // The state before 4a: roles assignable to everyone, with rules and field permissions
    await query(
      `UPDATE core."role" SET "canBeAssignedToUsers" = true, "canBeAssignedToApiKeys" = true WHERE id = ANY($1)`,
      [Object.values(roleIds)],
    );

    for (const roleId of Object.values(roleIds)) {
      await insertRestrictions({ roleId, applicationId });
    }

    await workspaceCacheService().invalidateAndRecompute(WORKSPACE_ID, [
      ...ROLE_CACHE_KEYS,
    ]);

    for (const [workspaceMemberId, roleId] of [
      [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, roleIds.requested],
      [WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, roleIds.agent],
      [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, roleIds.standalone],
    ]) {
      const { errors: assignmentErrors } = await updateWorkspaceMemberRole({
        input: { workspaceMemberId, roleId },
        expectToFail: false,
      });

      expect(assignmentErrors).toBeUndefined();
    }

    apiKeyIds = [
      await createApiKey(roleIds.requested),
      await createApiKey(roleIds.agent),
    ];

    for (const roleId of [roleIds.requested, roleIds.agent]) {
      const response = await createWebhook({
        input: {
          targetUrl: `https://example.com/role-backfill-${randomUUID()}`,
          operations: ['*.created'],
          roleId,
        },
      });

      expect(response.body.errors).toBeUndefined();
      webhookIds.push(response.body.data.createWebhook.id);
    }

    await query(
      `UPDATE core."workspace" SET "defaultRoleId" = $1 WHERE id = $2`,
      [roleIds.requested, WORKSPACE_ID],
    );
    await workspaceCacheService().invalidateAndRecompute(WORKSPACE_ID, [
      ...ROLE_CACHE_KEYS,
    ]);

    const { rolesPermissions } = await workspaceCacheService().getOrRecompute(
      WORKSPACE_ID,
      ['rolesPermissions'],
    );

    computedPermissionsBefore = {
      requested: withoutIds(rolesPermissions[roleIds.requested]),
      agent: withoutIds(rolesPermissions[roleIds.agent]),
      standalone: withoutIds(rolesPermissions[roleIds.standalone]),
    };
    restrictionSnapshotsBefore = {
      requested: await snapshotRestrictions(roleIds.requested),
      agent: await snapshotRestrictions(roleIds.agent),
    };
  });

  afterAll(async () => {
    for (const [workspaceMemberId, roleId] of [
      [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, initialRoleIds.jony],
      [WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL, initialRoleIds.phil],
      [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM, initialRoleIds.tim],
    ]) {
      await updateWorkspaceMemberRole({ input: { workspaceMemberId, roleId } });
    }

    for (const webhookId of webhookIds) {
      await deleteWebhook({ id: webhookId });
    }

    await query(`DELETE FROM core."apiKey" WHERE id = ANY($1)`, [apiKeyIds]);
    await query(
      `UPDATE core."workspace" SET "defaultRoleId" = $1 WHERE id = $2`,
      [initialRoleIds.workspaceDefault, WORKSPACE_ID],
    );
    await query(
      `DELETE FROM core."role" WHERE "workspaceId" = $1 AND (label LIKE 'Role backfill % copy' OR label = 'Role backfill standalone role')`,
      [WORKSPACE_ID],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await workspaceCacheService().invalidateAndRecompute(WORKSPACE_ID, [
      ...ROLE_CACHE_KEYS,
    ]);
    jest.useFakeTimers();
  });

  it('refuses a sync that would make the workspace default role agent-only, naming the role', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({ withStandaloneRole: true }),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Role \\"Role backfill requested role\\" is the workspace default role',
    );
    expect(
      await findRoleByUniversalIdentifier(REQUESTED_ROLE_UNIVERSAL_IDENTIFIER),
    ).toMatchObject({
      canBeAssignedToUsers: true,
    });
  });

  it('writes nothing on a dry run', async () => {
    const roleTargetsBefore = await findRoleTargetRoleIds();

    await runCommands({ dryRun: true });

    expect(await findRoleTargetRoleIds()).toEqual(roleTargetsBefore);
    expect(await findWorkspaceDefaultRoleId()).toBe(roleIds.requested);
    expect(await findCloneRole('Role backfill requested role')).toBeUndefined();
    expect(await countRestrictions(roleIds.requested)).toEqual({
      rules: 1,
      groups: 1,
      predicates: 1,
      fieldPermissions: 1,
    });
    expect(
      (
        await findRoleByUniversalIdentifier(
          STANDALONE_ROLE_UNIVERSAL_IDENTIFIER,
        )
      )?.applicationId,
    ).toBe(applicationId);
  });

  describe('once the commands ran', () => {
    let rolesOwnedByCustomAppBefore: unknown[];
    let rolesOwnedByStandardBefore: unknown[];
    let grantBefore: unknown;

    beforeAll(async () => {
      const twentyStandardApplicationId =
        (await findApplicationIdByUniversalIdentifier({
          universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        }))!;

      rolesOwnedByCustomAppBefore = await findRoleRowsOwnedBy(
        workspaceCustomApplicationId,
      );
      rolesOwnedByStandardBefore = await findRoleRowsOwnedBy(
        twentyStandardApplicationId,
      );
      grantBefore = await findApplicationGrantRole({
        applicationId,
        workspaceId: WORKSPACE_ID,
      });

      await runCommands();
    });

    it('moves every holder of the requested and agent roles to a clone with the same computed permissions', async () => {
      const { rolesPermissions } = await workspaceCacheService().getOrRecompute(
        WORKSPACE_ID,
        ['rolesPermissions'],
      );

      for (const [kind, userWorkspaceId] of [
        ['requested', USER_WORKSPACE_DATA_SEED_IDS.JONY],
        ['agent', USER_WORKSPACE_DATA_SEED_IDS.PHIL],
      ] as const) {
        const originalLabel = `Role backfill ${kind} role`;
        const clone = await findCloneRole(originalLabel);

        expect(clone).toMatchObject({
          applicationId: workspaceCustomApplicationId,
          canBeAssignedToUsers: true,
          canBeAssignedToApiKeys: true,
        });
        expect(withoutIds(rolesPermissions[clone.id])).toEqual(
          computedPermissionsBefore[kind],
        );
        expect(await snapshotRestrictions(clone.id)).toEqual(
          restrictionSnapshotsBefore[kind],
        );

        const holderRoleIds = await query<{ roleId: string }>(
          `SELECT "roleId" FROM core."roleTarget"
           WHERE "userWorkspaceId" = $1 OR "apiKeyId" = $2 OR "webhookId" = $3`,
          [
            userWorkspaceId,
            apiKeyIds[kind === 'requested' ? 0 : 1],
            webhookIds[kind === 'requested' ? 0 : 1],
          ],
        );

        expect(holderRoleIds.map(({ roleId }) => roleId)).toEqual(
          expect.arrayContaining([clone.id]),
        );
        expect(holderRoleIds.map(({ roleId }) => roleId)).not.toContain(
          roleIds[kind],
        );
      }
    });

    it('keeps the application own agent on the original agent role', async () => {
      const [roleTarget] = await query<{ roleId: string }>(
        `SELECT "roleTarget"."roleId" FROM core."roleTarget" AS "roleTarget"
         JOIN core."agent" AS agent ON agent.id = "roleTarget"."agentId"
         WHERE agent."universalIdentifier" = $1 AND agent."workspaceId" = $2`,
        [AGENT_UNIVERSAL_IDENTIFIER, WORKSPACE_ID],
      );

      expect(roleTarget.roleId).toBe(roleIds.agent);
    });

    it('moves the workspace default role to the clone, and a new member joins on it', async () => {
      const clone = await findCloneRole('Role backfill requested role');

      expect(await findWorkspaceDefaultRoleId()).toBe(clone.id);

      const { data: workspaceData } = await currentUser({
        gqlFields: 'currentWorkspace { isPublicInviteLinkEnabled }',
      });

      try {
        const memberToken = await signUpInWorkspaceAndGetAccessToken(
          `role-backfill-${randomUUID()}@example.com`,
        );
        const { data: memberData } = await currentUser({
          token: memberToken,
          gqlFields: 'workspaceMember { id } currentUserWorkspace { id }',
        });

        expect(
          await findRoleOfUserWorkspace(
            memberData.currentUser.currentUserWorkspace!.id,
          ),
        ).toBe(clone.id);

        await deleteUserFromWorkspace({
          input: {
            workspaceMemberIdToDelete:
              memberData.currentUser.workspaceMember.id,
          },
        });
      } finally {
        await updateWorkspace({
          data: {
            isPublicInviteLinkEnabled:
              workspaceData.currentUser.currentWorkspace
                ?.isPublicInviteLinkEnabled,
          },
        });
      }
    });

    it('leaves the originals agent-only, without rules or field permissions, their rule grants on their object permissions', async () => {
      const companyId = await findMetadataId(
        'objectMetadata',
        COMPANY.universalIdentifier,
      );

      for (const roleId of [roleIds.requested, roleIds.agent]) {
        expect(await countRestrictions(roleId)).toEqual({
          rules: 0,
          groups: 0,
          predicates: 0,
          fieldPermissions: 0,
        });

        const [role] = await query(
          `SELECT "canBeAssignedToUsers", "canBeAssignedToApiKeys", "canBeAssignedToAgents" FROM core."role" WHERE id = $1`,
          [roleId],
        );

        expect(role).toEqual({
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
          canBeAssignedToAgents: true,
        });

        const [companyPermission] = await query(
          `SELECT "canReadObjectRecords", "canUpdateObjectRecords" FROM core."objectPermission"
           WHERE "roleId" = $1 AND "objectMetadataId" = $2`,
          [roleId, companyId],
        );

        expect(companyPermission).toEqual({
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        });
      }
    });

    it('hands the standalone role over to the custom app with its member and rule', async () => {
      const [standaloneRole] = await query<{
        id: string;
        applicationId: string;
        universalIdentifier: string;
      }>(
        `SELECT id, "applicationId", "universalIdentifier" FROM core."role" WHERE id = $1`,
        [roleIds.standalone],
      );

      expect(standaloneRole.applicationId).toBe(workspaceCustomApplicationId);
      expect(standaloneRole.universalIdentifier).not.toBe(
        STANDALONE_ROLE_UNIVERSAL_IDENTIFIER,
      );
      expect(
        await findRoleOfUserWorkspace(USER_WORKSPACE_DATA_SEED_IDS.TIM),
      ).toBe(roleIds.standalone);
      expect(await countRestrictions(roleIds.standalone)).toEqual({
        rules: 1,
        groups: 1,
        predicates: 1,
        fieldPermissions: 1,
      });

      const rowOwners = await query<{ applicationId: string }>(
        `SELECT "applicationId" FROM core."rowLevelPermissionRule" WHERE "roleId" = $1
         UNION ALL SELECT "applicationId" FROM core."fieldPermission" WHERE "roleId" = $1`,
        [roleIds.standalone],
      );

      expect(new Set(rowOwners.map((row) => row.applicationId))).toEqual(
        new Set([workspaceCustomApplicationId]),
      );

      const { rolesPermissions } = await workspaceCacheService().getOrRecompute(
        WORKSPACE_ID,
        ['rolesPermissions'],
      );

      expect(withoutIds(rolesPermissions[roleIds.standalone])).toEqual(
        computedPermissionsBefore.standalone,
      );
    });

    it('leaves the grant, the custom app roles and the twenty-standard roles untouched', async () => {
      const twentyStandardApplicationId =
        (await findApplicationIdByUniversalIdentifier({
          universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        }))!;
      const clonesAndHandedOverRoleIds = new Set([
        roleIds.standalone,
        (await findCloneRole('Role backfill requested role')).id,
        (await findCloneRole('Role backfill agent role')).id,
      ]);

      expect(
        (await findRoleRowsOwnedBy(workspaceCustomApplicationId)).filter(
          (role) => !clonesAndHandedOverRoleIds.has(role.id as string),
        ),
      ).toEqual(rolesOwnedByCustomAppBefore);
      expect(await findRoleRowsOwnedBy(twentyStandardApplicationId)).toEqual(
        rolesOwnedByStandardBefore,
      );
      expect(
        await findApplicationGrantRole({
          applicationId,
          workspaceId: WORKSPACE_ID,
        }),
      ).toEqual(grantBefore);
    });

    it('changes nothing on a second run', async () => {
      const roleTargetsBefore = await findRoleTargetRoleIds();
      const rolesBefore = await query(
        `SELECT * FROM core."role" WHERE "workspaceId" = $1 ORDER BY id`,
        [WORKSPACE_ID],
      );

      await runCommands();

      expect(await findRoleTargetRoleIds()).toEqual(roleTargetsBefore);
      expect(
        await query(
          `SELECT * FROM core."role" WHERE "workspaceId" = $1 ORDER BY id`,
          [WORKSPACE_ID],
        ),
      ).toEqual(rolesBefore);
    });

    it('lets the application sync again once it drops the standalone role', async () => {
      const { errors } = await syncApplication({
        manifest: buildManifest({ withStandaloneRole: false }),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(
        await findRoleByUniversalIdentifier(
          STANDALONE_ROLE_UNIVERSAL_IDENTIFIER,
        ),
      ).toBeUndefined();
      expect(
        (
          await query(`SELECT id FROM core."role" WHERE id = $1`, [
            roleIds.standalone,
          ])
        ).length,
      ).toBe(1);
    });
  });
});
