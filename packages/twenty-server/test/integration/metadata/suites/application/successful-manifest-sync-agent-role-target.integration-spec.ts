import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getRoleTargetUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_SECOND_ROLE_ID = uuidv4();
const TEST_AGENT_ID = uuidv4();

const AGENT_GQL_FIELDS = 'id name label roleId applicationId';

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'agents' | 'roles'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Test Role',
          description: 'A test role',
          canBeAssignedToAgents: true,
        },
        {
          universalIdentifier: TEST_SECOND_ROLE_ID,
          label: 'Second Agent Role',
          description: 'Another agent-assignable role',
          canBeAssignedToAgents: true,
        },
      ],
      ...overrides,
    },
  });

const findAppAgent = async () => {
  const { data } = await findAgents({
    gqlFields: AGENT_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.findManyAgents.find((agent) => agent.name === 'sales-assistant');
};

describe('Manifest sync - agent roleTarget', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing agent roleTarget manifest sync',
      sourcePath: 'test-manifest-sync-agent-role-target',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should create a roleTarget when an agent declares roleUniversalIdentifier', async () => {
    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            prompt: 'You are a sales assistant.',
            roleUniversalIdentifier: TEST_ROLE_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const agent = await findAppAgent();

    expect(agent).toBeDefined();
    expect(agent?.roleId).toBeDefined();

    const rows = await global.testDataSource.query(
      `
      SELECT "roleId", "agentId", "universalIdentifier"
      FROM "core"."roleTarget"
      WHERE "agentId" = $1
      `,
      [agent?.id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].universalIdentifier).toBe(
      getRoleTargetUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        agentUniversalIdentifier: TEST_AGENT_ID,
      }),
    );
  }, 60000);

  it('should update the roleTarget when roleUniversalIdentifier changes', async () => {
    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            prompt: 'You are a sales assistant.',
            roleUniversalIdentifier: TEST_ROLE_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const agentAfterFirstSync = await findAppAgent();
    const firstRoleId = agentAfterFirstSync?.roleId;

    expect(firstRoleId).toBeDefined();

    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            prompt: 'You are a sales assistant.',
            roleUniversalIdentifier: TEST_SECOND_ROLE_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const agentAfterSecondSync = await findAppAgent();

    expect(agentAfterSecondSync?.roleId).toBeDefined();
    expect(agentAfterSecondSync?.roleId).not.toBe(firstRoleId);

    const rows = await global.testDataSource.query(
      `
      SELECT "roleId", "agentId"
      FROM "core"."roleTarget"
      WHERE "agentId" = $1
      `,
      [agentAfterSecondSync?.id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].roleId).toBe(agentAfterSecondSync?.roleId);
  }, 60000);

  it('should delete the roleTarget when roleUniversalIdentifier is removed', async () => {
    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            prompt: 'You are a sales assistant.',
            roleUniversalIdentifier: TEST_ROLE_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const agentAfterFirstSync = await findAppAgent();

    expect(agentAfterFirstSync?.roleId).toBeDefined();

    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            prompt: 'You are a sales assistant.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentAfterSecondSync = await findAppAgent();

    expect(agentAfterSecondSync?.roleId).toBeNull();

    const rows = await global.testDataSource.query(
      `
      SELECT "id"
      FROM "core"."roleTarget"
      WHERE "agentId" = $1
      `,
      [agentAfterSecondSync?.id],
    );

    expect(rows).toHaveLength(0);
  }, 60000);
});
