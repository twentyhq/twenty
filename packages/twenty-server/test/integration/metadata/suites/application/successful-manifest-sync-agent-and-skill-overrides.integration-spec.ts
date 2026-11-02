import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { activateSkill } from 'test/integration/metadata/suites/skill/utils/activate-skill.util';
import { deactivateSkill } from 'test/integration/metadata/suites/skill/utils/deactivate-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { updateSkill } from 'test/integration/metadata/suites/skill/utils/update-skill.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_AGENT_ID = uuidv4();
const TEST_SKILL_ID = uuidv4();

const AGENT_GQL_FIELDS = 'id name label prompt isActive applicationId';
const SKILL_GQL_FIELDS = 'id name label content isActive applicationId';

const buildManifest = ({
  agentLabel,
  skillLabel,
}: {
  agentLabel: string;
  skillLabel: string;
}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      agents: [
        {
          universalIdentifier: TEST_AGENT_ID,
          name: 'override-test-agent',
          label: agentLabel,
          prompt: 'You are the application agent.',
        },
      ],
      skills: [
        {
          universalIdentifier: TEST_SKILL_ID,
          name: 'override-test-skill',
          label: skillLabel,
          content: 'Application skill content',
        },
      ],
    },
  });

const findAppAgent = async () => {
  const { data } = await findAgents({
    gqlFields: AGENT_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.findManyAgents.find(
    (agent) => agent.name === 'override-test-agent',
  );
};

const findAppSkill = async () => {
  const { data } = await findSkills({
    gqlFields: SKILL_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.skills.find((skill) => skill.name === 'override-test-skill');
};

const findRow = async (table: 'agent' | 'skill') => {
  const rows = await global.testDataSource.query(
    `SELECT label, "isActive", overrides FROM core."${table}" WHERE "universalIdentifier" = $1`,
    [table === 'agent' ? TEST_AGENT_ID : TEST_SKILL_ID],
  );

  return rows[0];
};

describe('Manifest sync - workspace overrides on agents and skills', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing agent and skill overrides',
      sourcePath: 'test-manifest-sync-agent-skill-overrides',
    });

    await syncApplication({
      manifest: buildManifest({
        agentLabel: 'Application agent',
        skillLabel: 'Application skill',
      }),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should store workspace edits and archives as overrides', async () => {
    const agent = await findAppAgent();
    const skill = await findAppSkill();

    expect(agent).toBeDefined();
    expect(skill).toBeDefined();

    const { data: agentData } = await updateOneAgent({
      input: {
        id: agent!.id,
        name: agent!.name,
        label: 'Workspace agent',
        prompt: 'You are the workspace agent.',
        isActive: false,
      },
      gqlFields: AGENT_GQL_FIELDS,
      expectToFail: false,
    });

    expect(agentData.updateOneAgent).toMatchObject({
      name: 'override-test-agent',
      label: 'Workspace agent',
      prompt: 'You are the workspace agent.',
      isActive: false,
    });

    const { data: skillData } = await updateSkill({
      input: {
        id: skill!.id,
        label: 'Workspace skill',
        content: 'Workspace skill content',
      },
      gqlFields: SKILL_GQL_FIELDS,
      expectToFail: false,
    });

    expect(skillData.updateSkill).toMatchObject({
      label: 'Workspace skill',
      content: 'Workspace skill content',
      isActive: true,
    });

    await deactivateSkill({
      input: { id: skill!.id },
      gqlFields: SKILL_GQL_FIELDS,
      expectToFail: false,
    });

    const agentRow = await findRow('agent');
    const skillRow = await findRow('skill');

    expect(agentRow.label).toBe('Application agent');
    expect(agentRow.isActive).toBe(true);
    expect(Object.values(agentRow.overrides)).toEqual([
      {
        label: 'Workspace agent',
        prompt: 'You are the workspace agent.',
        isActive: false,
      },
    ]);
    expect(skillRow.label).toBe('Application skill');
    expect(skillRow.isActive).toBe(true);
    expect(Object.values(skillRow.overrides)).toEqual([
      {
        label: 'Workspace skill',
        content: 'Workspace skill content',
        isActive: false,
      },
    ]);
  }, 60000);

  it('should keep the overrides and the archive when the application syncs again', async () => {
    await syncApplication({
      manifest: buildManifest({
        agentLabel: 'Application agent v2',
        skillLabel: 'Application skill v2',
      }),
      expectToFail: false,
    });

    expect(await findAppAgent()).toMatchObject({
      label: 'Workspace agent',
      prompt: 'You are the workspace agent.',
      isActive: false,
    });
    expect(await findAppSkill()).toMatchObject({
      label: 'Workspace skill',
      content: 'Workspace skill content',
      isActive: false,
    });

    expect((await findRow('agent')).label).toBe('Application agent v2');
    expect((await findRow('skill')).label).toBe('Application skill v2');
  }, 60000);

  it('should unarchive through the overrides', async () => {
    const agent = await findAppAgent();
    const skill = await findAppSkill();

    await updateOneAgent({
      input: { id: agent!.id, isActive: true },
      gqlFields: AGENT_GQL_FIELDS,
      expectToFail: false,
    });
    await activateSkill({
      input: { id: skill!.id },
      gqlFields: SKILL_GQL_FIELDS,
      expectToFail: false,
    });

    expect((await findAppAgent())?.isActive).toBe(true);
    expect((await findAppSkill())?.isActive).toBe(true);
    expect(Object.values((await findRow('agent')).overrides)).toEqual([
      { label: 'Workspace agent', prompt: 'You are the workspace agent.' },
    ]);
    expect(Object.values((await findRow('skill')).overrides)).toEqual([
      { label: 'Workspace skill', content: 'Workspace skill content' },
    ]);
  }, 60000);
});
