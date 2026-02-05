import { splitFieldPath } from 'src/modules/dashboard/tools/utils/split-field-path.util';

describe('splitFieldPath', () => {
  it('handles simple field without dot', () => {
    expect(splitFieldPath('name')).toEqual({
      baseField: 'name',
      subFieldPath: undefined,
    });
  });

  it('handles single-level dotted path', () => {
    expect(splitFieldPath('address.city')).toEqual({
      baseField: 'address',
      subFieldPath: 'city',
    });
  });

  it('handles multi-level dotted path', () => {
    expect(splitFieldPath('a.b.c')).toEqual({
      baseField: 'a',
      subFieldPath: 'b.c',
    });
  });

  it('handles empty string', () => {
    expect(splitFieldPath('')).toEqual({
      baseField: '',
      subFieldPath: undefined,
    });
  });

  it('handles leading dot', () => {
    expect(splitFieldPath('.field')).toEqual({
      baseField: '',
      subFieldPath: 'field',
    });
  });

  it('handles trailing dot', () => {
    expect(splitFieldPath('field.')).toEqual({
      baseField: 'field',
      subFieldPath: '',
    });
  });

  it('trims whitespace around parts', () => {
    expect(splitFieldPath(' address . city ')).toEqual({
      baseField: 'address',
      subFieldPath: 'city',
    });
  });

  it('handles whitespace-only input', () => {
    expect(splitFieldPath('   ')).toEqual({
      baseField: '   ',
      subFieldPath: undefined,
    });
  });

  it('handles composite subfield paths', () => {
    expect(splitFieldPath('owner.address.addressCity')).toEqual({
      baseField: 'owner',
      subFieldPath: 'address.addressCity',
    });
  });
});
