import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const TEST_APP_ID = 'a1b2c3d4-0030-4000-a000-000000000001';
const TEST_ROLE_ID = 'a1b2c3d4-0030-4000-a000-000000000002';
const TEST_AGENT_ID = 'a1b2c3d4-0030-4000-a000-000000000003';
const OTHER_APP_ID = 'a1b2c3d4-0030-4000-a000-000000000011';
const OTHER_APP_ROLE_ID = 'a1b2c3d4-0030-4000-a000-000000000012';

const buildManifestWithAgentRole = (roleUniversalIdentifier: string) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      agents: [
        {
          universalIdentifier: TEST_AGENT_ID,
          name: 'role-thief',
          label: 'Role Thief',
          prompt: 'You are an agent.',
          roleUniversalIdentifier,
        },
      ],
    },
  });

const findRoleUniversalIdentifier = async (roleId: string) => {
  const rows = await global.testDataSource.query(
    `SELECT "universalIdentifier" FROM core."role" WHERE id = $1`,
    [roleId],
  );

  return rows[0].universalIdentifier as string;
};

const findRoleIdByUniversalIdentifier = async (universalIdentifier: string) => {
  const rows = await global.testDataSource.query(
    `SELECT id FROM core."role" WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  return rows[0].id as string;
};

describe('Sync application should fail when an agent uses a role the application does not own', () => {
  let workspaceRoleId: string;
  let workspaceRoleUniversalIdentifier: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APP_ID,
      name: 'Other Application',
      description: 'App owning an agent-assignable role',
      sourcePath: 'test-agent-role-not-owned-other',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: OTHER_APP_ID,
        roleId: OTHER_APP_ROLE_ID,
        overrides: {
          roles: [
            {
              universalIdentifier: OTHER_APP_ROLE_ID,
              label: 'Other App Agent Role',
              description: 'Agent-assignable role owned by another app',
              canBeAssignedToAgents: true,
            },
          ],
        },
      }),
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Agent Role Not Owned App',
      description: 'App for testing agent role ownership',
      sourcePath: 'test-agent-role-not-owned',
    });

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Workspace Agent Role',
        description: 'Agent-assignable role owned by the workspace',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    workspaceRoleId = data.createOneRole.id;
    workspaceRoleUniversalIdentifier =
      await findRoleUniversalIdentifier(workspaceRoleId);
  }, 120000);

  afterAll(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: workspaceRoleId },
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APP_ID,
    });
  });

  it('should fail when an agent uses the standard admin role', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithAgentRole(
        STANDARD_ROLE.admin.universalIdentifier,
      ),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when an agent uses a workspace custom role', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithAgentRole(workspaceRoleUniversalIdentifier),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when an agent uses a role owned by another application', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithAgentRole(OTHER_APP_ROLE_ID),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should let the workspace assign a role owned by another application to its agent', async () => {
    const otherAppRoleId =
      await findRoleIdByUniversalIdentifier(OTHER_APP_ROLE_ID);

    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Workspace Agent',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
      },
    });

    const agentId = createData.createOneAgent.id;

    try {
      const { data: updateData } = await updateOneAgent({
        expectToFail: false,
        input: { id: agentId, roleId: otherAppRoleId },
      });

      expect(updateData.updateOneAgent.roleId).toBe(otherAppRoleId);
    } finally {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: agentId },
      });
    }
  }, 60000);
});
