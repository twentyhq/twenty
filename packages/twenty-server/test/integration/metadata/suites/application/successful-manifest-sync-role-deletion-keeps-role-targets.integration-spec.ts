import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import {
  getRoleTargetUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const DROPPED_ROLE_ID = uuidv4();
const REPLACEMENT_ROLE_ID = uuidv4();
const TEST_AGENT_ID = uuidv4();

const APP_DEFAULT_ROLE = {
  universalIdentifier: TEST_ROLE_ID,
  label: 'Rebind Test App Role',
  description: 'Default role of the rebind test application',
};

const DROPPED_ROLE = {
  universalIdentifier: DROPPED_ROLE_ID,
  label: 'Rebind Test Dropped Role',
  description: 'Role that a later manifest drops',
};

const REPLACEMENT_ROLE = {
  universalIdentifier: REPLACEMENT_ROLE_ID,
  label: 'Rebind Test Replacement Role',
  description: 'Role that replaces the dropped role',
};

type PlannedAction = {
  type: string;
  metadataName: string;
  universalIdentifier?: string;
  diff?: Record<string, { before: unknown; after: unknown }>;
};

type RoleTargetRow = {
  id: string;
  universalIdentifier: string;
  roleId: string;
};

const buildManifest = (
  overrides: Partial<Pick<Manifest, 'agents' | 'roles'>>,
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const buildAgentManifest = (roleUniversalIdentifier: string) => ({
  universalIdentifier: TEST_AGENT_ID,
  name: 'rebind-assistant',
  label: 'Rebind Assistant',
  prompt: 'You are an assistant.',
  roleUniversalIdentifier,
});

const findJonyRoleTargets = (): Promise<RoleTargetRow[]> =>
  global.testDataSource.query(
    `SELECT id, "universalIdentifier", "roleId" FROM core."roleTarget"
     WHERE "userWorkspaceId" = $1 AND "workspaceId" = $2`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY, SEED_APPLE_WORKSPACE_ID],
  );

const findRoleTargetsByUniversalIdentifier = (
  universalIdentifier: string,
): Promise<RoleTargetRow[]> =>
  global.testDataSource.query(
    `SELECT id, "universalIdentifier", "roleId" FROM core."roleTarget"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

const findRoleIdByUniversalIdentifier = async (
  universalIdentifier: string,
): Promise<string> => {
  const [role] = await global.testDataSource.query(
    `SELECT id FROM core."role"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return role.id;
};

describe('Manifest sync - dropping a role keeps its role targets', () => {
  let originalJonyRoleId: string;
  let workspaceDefaultRoleId: string;
  let workspaceDefaultRoleUniversalIdentifier: string;

  beforeAll(async () => {
    const [originalJonyRoleTarget] = await findJonyRoleTargets();

    originalJonyRoleId = originalJonyRoleTarget.roleId;

    const [workspaceDefaultRole] = await global.testDataSource.query(
      `SELECT role.id, role."universalIdentifier"
       FROM core."workspace" workspace
       JOIN core."role" role ON role.id = workspace."defaultRoleId"
       WHERE workspace.id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    workspaceDefaultRoleId = workspaceDefaultRole.id;
    workspaceDefaultRoleUniversalIdentifier =
      workspaceDefaultRole.universalIdentifier;
  });

  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Role Rebind Test Application',
      description: 'App for testing role targets when a manifest drops a role',
      sourcePath: 'test-manifest-sync-role-deletion-keeps-role-targets',
    });
  }, 60000);

  afterEach(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalJonyRoleId,
      },
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should plan the rebind before the role delete, apply it in place and converge on a second plan', async () => {
    await syncApplication({
      manifest: buildManifest({ roles: [APP_DEFAULT_ROLE, DROPPED_ROLE] }),
      expectToFail: false,
    });

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: await findRoleIdByUniversalIdentifier(DROPPED_ROLE_ID),
      },
    });

    const [jonyRoleTargetBeforeDrop] = await findJonyRoleTargets();

    const manifestWithoutDroppedRole = buildManifest({
      roles: [APP_DEFAULT_ROLE],
    });

    const { data: planData, errors: planErrors } = await syncApplication({
      manifest: manifestWithoutDroppedRole,
      dryRun: true,
      expectToFail: false,
    });

    expect(planErrors).toBeUndefined();

    const plannedActions = planData.syncApplication.actions as PlannedAction[];

    const rebindActionIndex = plannedActions.findIndex(
      (action) =>
        action.type === 'update' &&
        action.metadataName === 'roleTarget' &&
        action.universalIdentifier ===
          jonyRoleTargetBeforeDrop.universalIdentifier,
    );

    const roleDeleteActionIndex = plannedActions.findIndex(
      (action) =>
        action.type === 'delete' &&
        action.metadataName === 'role' &&
        action.universalIdentifier === DROPPED_ROLE_ID,
    );

    expect(rebindActionIndex).toBeGreaterThanOrEqual(0);
    expect(roleDeleteActionIndex).toBeGreaterThan(rebindActionIndex);
    expect(plannedActions[rebindActionIndex].diff).toEqual({
      roleUniversalIdentifier: {
        before: DROPPED_ROLE_ID,
        after: workspaceDefaultRoleUniversalIdentifier,
      },
    });

    const { errors: applyErrors } = await syncApplication({
      manifest: manifestWithoutDroppedRole,
      expectToFail: false,
    });

    expect(applyErrors).toBeUndefined();
    expect(await findJonyRoleTargets()).toEqual([
      {
        id: jonyRoleTargetBeforeDrop.id,
        universalIdentifier: jonyRoleTargetBeforeDrop.universalIdentifier,
        roleId: workspaceDefaultRoleId,
      },
    ]);

    const { data: secondPlanData } = await syncApplication({
      manifest: manifestWithoutDroppedRole,
      dryRun: true,
      expectToFail: false,
    });

    expect(
      (secondPlanData.syncApplication.actions as PlannedAction[]).filter(
        (action) =>
          action.metadataName === 'role' ||
          action.metadataName === 'roleTarget',
      ),
    ).toEqual([]);
  }, 60000);

  it('should keep an agent role target that a manifest moves from a dropped role onto a role it creates', async () => {
    const agentRoleTargetUniversalIdentifier = getRoleTargetUniversalIdentifier(
      {
        applicationUniversalIdentifier: TEST_APP_ID,
        agentUniversalIdentifier: TEST_AGENT_ID,
      },
    );

    await syncApplication({
      manifest: buildManifest({
        roles: [APP_DEFAULT_ROLE, DROPPED_ROLE],
        agents: [buildAgentManifest(DROPPED_ROLE_ID)],
      }),
      expectToFail: false,
    });

    const [agentRoleTargetBeforeMove] =
      await findRoleTargetsByUniversalIdentifier(
        agentRoleTargetUniversalIdentifier,
      );

    const { errors } = await syncApplication({
      manifest: buildManifest({
        roles: [APP_DEFAULT_ROLE, REPLACEMENT_ROLE],
        agents: [buildAgentManifest(REPLACEMENT_ROLE_ID)],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(
      await findRoleTargetsByUniversalIdentifier(
        agentRoleTargetUniversalIdentifier,
      ),
    ).toEqual([
      {
        id: agentRoleTargetBeforeMove.id,
        universalIdentifier: agentRoleTargetUniversalIdentifier,
        roleId: await findRoleIdByUniversalIdentifier(REPLACEMENT_ROLE_ID),
      },
    ]);
  }, 60000);
});
