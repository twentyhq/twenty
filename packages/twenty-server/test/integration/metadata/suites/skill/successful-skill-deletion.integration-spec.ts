import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';
import { findSkill } from 'test/integration/metadata/suites/skill/utils/find-skill.util';

describe('Skill deletion should succeed', () => {
  it('should successfully delete a custom skill', async () => {
    const { data: createData } = await createSkill({
      expectToFail: false,
      input: {
        name: 'skillToDelete',
        label: 'Skill To Delete',
        content: 'This skill will be deleted',
      },
    });

    const skillId = createData.createSkill.id;

    const { data: findBeforeData } = await findSkill({
      expectToFail: false,
      input: { id: skillId },
    });

    expect(findBeforeData.skill.id).toBe(skillId);

    const { data: deleteData } = await deleteSkill({
      expectToFail: false,
      input: { id: skillId },
    });

    expect(deleteData.deleteSkill).toMatchObject({
      id: skillId,
      name: 'skillToDelete',
      label: 'Skill To Delete',
    });

    // After deletion, the skill query returns null instead of throwing an error
    const { data: findAfterData } = await findSkill({
      expectToFail: false,
      input: { id: skillId },
    });

    expect(findAfterData.skill).toBeNull();
  });
});
