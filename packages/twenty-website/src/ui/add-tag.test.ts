import { addTag } from './add-tag';

describe('addTag', () => {
  it('appends a trimmed tag', () => {
    expect(addTag(['React'], '  TypeScript  ')).toEqual([
      'React',
      'TypeScript',
    ]);
  });

  it('ignores a blank or whitespace-only tag', () => {
    expect(addTag(['React'], '   ')).toEqual(['React']);
    expect(addTag([], '')).toEqual([]);
  });

  it('ignores an exact duplicate', () => {
    expect(addTag(['React', 'Node.js'], 'React')).toEqual(['React', 'Node.js']);
  });

  it('returns a new array (does not mutate the input)', () => {
    const values = ['React'];
    const next = addTag(values, 'GraphQL');
    expect(next).not.toBe(values);
    expect(values).toEqual(['React']);
  });
});
