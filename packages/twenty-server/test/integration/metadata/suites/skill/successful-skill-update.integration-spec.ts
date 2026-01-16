import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';
import { updateSkill } from 'test/integration/metadata/suites/skill/utils/update-skill.util';

describe('Skill update should succeed', () => {
  let testSkillId: string;

  beforeEach(async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'testSkillToUpdate',
        label: 'Test Skill To Update',
        description: 'Original description',
        icon: 'IconSparkles',
        content: 'Original content',
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

  it('should update skill label', async () => {
    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        label: 'Updated Skill Label',
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      label: 'Updated Skill Label',
      description: 'Original description',
      icon: 'IconSparkles',
      content: 'Original content',
    });
  });

  it('should update skill description', async () => {
    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        description: 'Updated description',
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      label: 'Test Skill To Update',
      description: 'Updated description',
    });
  });

  it('should update skill icon', async () => {
    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        icon: 'IconRobot',
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      icon: 'IconRobot',
    });
  });

  it('should update skill content', async () => {
    const newContent = 'Updated content with new instructions';

    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        content: newContent,
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      content: newContent,
    });
  });

  it('should update multiple fields at once', async () => {
    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        label: 'Completely Updated Skill',
        description: 'Completely updated description',
        icon: 'IconBrain',
        content: 'Completely updated content',
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      label: 'Completely Updated Skill',
      description: 'Completely updated description',
      icon: 'IconBrain',
      content: 'Completely updated content',
    });
  });

  it('should update label to a unique value', async () => {
    const { data } = await updateSkill({
      expectToFail: false,
      input: {
        id: testSkillId,
        label: 'Unique Updated Label',
      },
    });

    expect(data.updateSkill).toMatchObject({
      id: testSkillId,
      label: 'Unique Updated Label',
    });
  });
});
