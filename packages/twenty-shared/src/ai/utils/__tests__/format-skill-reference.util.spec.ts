import { formatSkillReference } from '@/ai/utils/format-skill-reference.util';

describe('formatSkillReference', () => {
  it('should format a skill reference with its id and label', () => {
    expect(
      formatSkillReference({
        skillId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        label: 'Workflow building',
      }),
    ).toBe('[[skill:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow building]]');
  });
});
