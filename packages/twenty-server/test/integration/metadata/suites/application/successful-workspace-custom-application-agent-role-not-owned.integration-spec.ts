import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

const OTHER_APP_ID = 'a1b2c3d4-0031-4000-a000-000000000001';
const OTHER_APP_ROLE_ID = 'a1b2c3d4-0031-4000-a000-000000000002';

describe('Workspace custom application can assign a role it does not own to its agents', () => {
  let otherAppRoleId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APP_ID,
      name: 'Other Application',
      description: 'App owning an agent-assignable role',
      sourcePath: 'test-workspace-agent-role-not-owned',
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

    const [role] = await global.testDataSource.query<{ id: string }[]>(
      `SELECT id FROM core."role" WHERE "universalIdentifier" = $1`,
      [OTHER_APP_ROLE_ID],
    );

    otherAppRoleId = role.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APP_ID,
    });
  });

  it('should create an agent with a role owned by another application', async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Workspace Agent With Other App Role',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
        roleId: otherAppRoleId,
      },
    });

    try {
      expect(data.createOneAgent.roleId).toBe(otherAppRoleId);
    } finally {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: data.createOneAgent.id },
      });
    }
  }, 60000);

  it('should assign a role owned by another application to an existing agent', async () => {
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
