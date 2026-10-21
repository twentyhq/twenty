import { parseFieldReferenceFilterValue } from '@/utils/filter/utils/parseFieldReferenceFilterValue';

describe('parseFieldReferenceFilterValue', () => {
  it('parses a field of the same record', () => {
    expect(parseFieldReferenceFilterValue('lastActivityAt')).toEqual({
      fieldName: 'lastActivityAt',
    });
  });

  it('parses a field reached through a relation', () => {
    expect(parseFieldReferenceFilterValue('thread.lastActivityAt')).toEqual({
      relationFieldName: 'thread',
      fieldName: 'lastActivityAt',
    });
  });

  it.each([
    ['a non string value', 42],
    ['an empty string', ''],
    ['an empty segment', 'thread.'],
    ['a path longer than one relation', 'thread.owner.createdAt'],
  ])('rejects %s', (_, value) => {
    expect(parseFieldReferenceFilterValue(value)).toBeUndefined();
  });
});
