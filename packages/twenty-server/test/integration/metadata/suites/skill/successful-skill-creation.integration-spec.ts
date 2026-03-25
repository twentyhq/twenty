import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';

import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';

describe('Skill creation should succeed', () => {
  let createdSkillId: string;

  afterEach(async () => {
    if (createdSkillId) {
      await deleteSkill({
        expectToFail: false,
        input: { id: createdSkillId },
      });
    }
  });

  it('should create a basic custom skill with minimal input', async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'testSkill',
        label: 'Test Skill',
        content: 'This is the skill content with instructions',
      },
    });

    createdSkillId = data?.createSkill?.id;

    expect(data.createSkill).toMatchObject({
      id: expect.any(String),
      name: 'testSkill',
      label: 'Test Skill',
      icon: null,
      description: null,
      content: 'This is the skill content with instructions',
      isCustom: true,
      isActive: true,
    });
  });

  it('should create skill with all optional fields', async () => {
    const input = {
      name: 'customSkillName',
      label: 'Custom Skill Label',
      icon: 'IconSparkles',
      description: 'A custom skill with all fields specified',
      content: 'Detailed instructions for the skill',
    } as const satisfies CreateSkillInput;

    const { data } = await createSkill({
      expectToFail: false,
      input,
    });

    createdSkillId = data?.createSkill?.id;

    expect(data.createSkill).toMatchObject({
      id: expect.any(String),
      ...input,
      isCustom: true,
      isActive: true,
    });
  });

  it('should sanitize input by trimming whitespace', async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: '  skillWithSpaces  ',
        label: '  Skill With Spaces  ',
        icon: '  IconSparkles  ',
        description: '  Description with spaces  ',
        content: '  Content with spaces  ',
      },
    });

    createdSkillId = data?.createSkill?.id;

    expect(data.createSkill).toMatchObject({
      id: expect.any(String),
      name: 'skillWithSpaces',
      label: 'Skill With Spaces',
      icon: 'IconSparkles',
      description: 'Description with spaces',
      content: 'Content with spaces',
    });
  });

  it('should create skill with long content', async () => {
    const longContent =
      'This is a long content that describes the skill instructions in detail.';

    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'longContentSkill',
        label: 'Long Content Skill',
        content: longContent,
      },
    });

    createdSkillId = data?.createSkill?.id;

    expect(data.createSkill).toMatchObject({
      id: expect.any(String),
      name: 'longContentSkill',
      label: 'Long Content Skill',
      content: longContent,
      isCustom: true,
      isActive: true,
    });
  });

  it('should preserve markdown formatting with newlines in content', async () => {
    const markdownContent = `# Skill Instructions

## Step 1
Do the first thing.

## Step 2
Do the second thing.

- List item 1
- List item 2`;

    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'markdownSkill',
        label: 'Markdown Skill',
        content: markdownContent,
      },
    });

    createdSkillId = data?.createSkill?.id;

    expect(data.createSkill).toMatchObject({
      id: expect.any(String),
      name: 'markdownSkill',
      label: 'Markdown Skill',
      content: markdownContent,
      isCustom: true,
      isActive: true,
    });
  });
});
