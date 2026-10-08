import {
  buildReferencedSkillsSection,
  type ReferencedSkill,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-skills-section.util';

const SKILL_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Always create a trigger first.' }],
    },
  ],
});

const skill: ReferencedSkill = {
  name: 'workflow-building',
  label: 'Workflow building',
  content: SKILL_CONTENT,
};

describe('buildReferencedSkillsSection', () => {
  it('should return an empty string without referenced skills', () => {
    expect(buildReferencedSkillsSection([])).toBe('');
  });

  it('should inline each referenced skill with its markdown content', () => {
    const section = buildReferencedSkillsSection([skill]);

    expect(section).toContain('## Referenced Skills (already loaded)');
    expect(section).toContain('### Workflow building (`workflow-building`)');
    expect(section).toContain('Always create a trigger first.');
    expect(section).toContain('do NOT call `load_skills` for them');
  });
});
