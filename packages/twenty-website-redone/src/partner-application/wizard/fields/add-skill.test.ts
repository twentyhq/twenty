import { addSkill } from './add-skill';

describe('addSkill', () => {
  it('appends a trimmed skill', () => {
    expect(addSkill(['React'], '  TypeScript  ')).toEqual([
      'React',
      'TypeScript',
    ]);
  });

  it('ignores a blank or whitespace-only skill', () => {
    expect(addSkill(['React'], '   ')).toEqual(['React']);
    expect(addSkill([], '')).toEqual([]);
  });

  it('ignores an exact duplicate', () => {
    expect(addSkill(['React', 'Node.js'], 'React')).toEqual([
      'React',
      'Node.js',
    ]);
  });

  it('returns a new array (does not mutate the input)', () => {
    const values = ['React'];
    const next = addSkill(values, 'GraphQL');
    expect(next).not.toBe(values);
    expect(values).toEqual(['React']);
  });
});
