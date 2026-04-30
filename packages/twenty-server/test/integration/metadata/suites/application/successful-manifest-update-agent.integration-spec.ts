import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_AGENT_ID = uuidv4();
const TEST_SECOND_AGENT_ID = uuidv4();

const AGENT_GQL_FIELDS =
  'id name label description prompt icon applicationId modelId';

const buildManifest = (overrides?: Partial<Pick<Manifest, 'agents'>>) =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findAppAgents = async () => {
  const { data } = await findAgents({
    gqlFields: AGENT_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.findManyAgents.filter(
    (agent) => agent.name === 'sales-assistant' || agent.name === 'support-bot',
  );
};

describe('Manifest update - agents', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing agent manifest updates',
      sourcePath: 'test-manifest-update-agent',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should create a new agent when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ agents: [] }),
      expectToFail: false,
    });

    const agentsAfterFirstSync = await findAppAgents();

    expect(agentsAfterFirstSync).toHaveLength(0);

    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            description: 'An AI agent that helps with sales tasks',
            icon: 'IconRobot',
            prompt:
              'You are a sales assistant. Help users with prospecting and outreach.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentsAfterSecondSync = await findAppAgents();

    expect(agentsAfterSecondSync).toHaveLength(1);
    expect(agentsAfterSecondSync[0]).toMatchObject({
      name: 'sales-assistant',
      label: 'Sales Assistant',
      description: 'An AI agent that helps with sales tasks',
      icon: 'IconRobot',
      prompt:
        'You are a sales assistant. Help users with prospecting and outreach.',
    });
  }, 60000);

  it('should update an agent when properties change in manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            description: 'An AI agent that helps with sales tasks',
            icon: 'IconRobot',
            prompt:
              'You are a sales assistant. Help users with prospecting and outreach.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentsAfterFirstSync = await findAppAgents();

    expect(agentsAfterFirstSync).toHaveLength(1);
    expect(agentsAfterFirstSync[0]).toMatchObject({
      label: 'Sales Assistant',
      description: 'An AI agent that helps with sales tasks',
    });

    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Senior Sales Assistant',
            description: 'An advanced AI agent for enterprise sales',
            icon: 'IconRobot',
            prompt:
              'You are a senior sales assistant specializing in enterprise deals. Help users with complex prospecting, multi-threaded outreach, and deal strategy.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentsAfterSecondSync = await findAppAgents();

    expect(agentsAfterSecondSync).toHaveLength(1);
    expect(agentsAfterSecondSync[0]).toMatchObject({
      name: 'sales-assistant',
      label: 'Senior Sales Assistant',
      description: 'An advanced AI agent for enterprise sales',
      prompt:
        'You are a senior sales assistant specializing in enterprise deals. Help users with complex prospecting, multi-threaded outreach, and deal strategy.',
    });
  }, 60000);

  it('should delete an agent when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            description: 'An AI agent that helps with sales tasks',
            icon: 'IconRobot',
            prompt:
              'You are a sales assistant. Help users with prospecting and outreach.',
          },
          {
            universalIdentifier: TEST_SECOND_AGENT_ID,
            name: 'support-bot',
            label: 'Support Bot',
            description: 'An AI agent for customer support',
            icon: 'IconHeadset',
            prompt:
              'You are a customer support agent. Help users resolve their issues.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentsAfterFirstSync = await findAppAgents();

    expect(agentsAfterFirstSync).toHaveLength(2);
    expect(
      agentsAfterFirstSync.find((agent) => agent.name === 'sales-assistant'),
    ).toBeDefined();
    expect(
      agentsAfterFirstSync.find((agent) => agent.name === 'support-bot'),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest({
        agents: [
          {
            universalIdentifier: TEST_AGENT_ID,
            name: 'sales-assistant',
            label: 'Sales Assistant',
            description: 'An AI agent that helps with sales tasks',
            icon: 'IconRobot',
            prompt:
              'You are a sales assistant. Help users with prospecting and outreach.',
          },
        ],
      }),
      expectToFail: false,
    });

    const agentsAfterSecondSync = await findAppAgents();

    expect(agentsAfterSecondSync).toHaveLength(1);
    expect(agentsAfterSecondSync[0]).toMatchObject({
      name: 'sales-assistant',
      label: 'Sales Assistant',
    });
    expect(
      agentsAfterSecondSync.find((agent) => agent.name === 'support-bot'),
    ).toBeUndefined();
  }, 60000);
});
