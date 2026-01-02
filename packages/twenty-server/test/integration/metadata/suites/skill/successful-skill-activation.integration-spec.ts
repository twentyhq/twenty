import { activateSkill } from 'test/integration/metadata/suites/skill/utils/activate-skill.util';
import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deactivateSkill } from 'test/integration/metadata/suites/skill/utils/deactivate-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';

describe('Skill activation should succeed', () => {
  let testSkillId: string;

  beforeEach(async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'testSkillForActivation',
        label: 'Test Skill For Activation',
        content: 'Test content',
      },
    });

    testSkillId = data.createSkill.id;
  });

  afterEach(async () => {
    await deleteSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });
  });

  it('should create a skill with isActive true by default', async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'activeByDefaultSkill',
        label: 'Active By Default Skill',
        content: 'Test content',
      },
    });

    const skillId = data.createSkill.id;

    expect(data.createSkill).toMatchObject({
      id: skillId,
      isActive: true,
      isCustom: true,
    });

    await deleteSkill({
      expectToFail: false,
      input: { id: skillId },
    });
  });

  it('should deactivate a skill', async () => {
    const { data } = await deactivateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(data.deactivateSkill).toMatchObject({
      id: testSkillId,
      isActive: false,
    });
  });

  it('should activate a deactivated skill', async () => {
    await deactivateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    const { data } = await activateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(data.activateSkill).toMatchObject({
      id: testSkillId,
      isActive: true,
    });
  });

  it('should allow deactivating an already active skill (no-op)', async () => {
    const { data: firstDeactivate } = await deactivateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(firstDeactivate.deactivateSkill.isActive).toBe(false);

    const { data: secondDeactivate } = await deactivateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(secondDeactivate.deactivateSkill.isActive).toBe(false);
  });

  it('should allow activating an already active skill (no-op)', async () => {
    const { data: firstActivate } = await activateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(firstActivate.activateSkill.isActive).toBe(true);

    const { data: secondActivate } = await activateSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });

    expect(secondActivate.activateSkill.isActive).toBe(true);
  });
});
