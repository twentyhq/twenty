import { splitFullName } from '@/sections/PartnerApplication/split-full-name';

describe('splitFullName', () => {
  it('splits a standard "first last" name', () => {
    expect(splitFullName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('returns an empty lastName for a single-token name', () => {
    expect(splitFullName('Madonna')).toEqual({
      firstName: 'Madonna',
      lastName: '',
    });
  });

  it('keeps middle and additional names in lastName', () => {
    expect(splitFullName('John Michael Doe')).toEqual({
      firstName: 'John',
      lastName: 'Michael Doe',
    });
  });

  it('collapses arbitrary whitespace between tokens', () => {
    expect(splitFullName('  John   Doe  ')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('treats tabs and newlines as separators', () => {
    expect(splitFullName('John\t\nDoe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('returns empty fields for an empty or whitespace-only string', () => {
    expect(splitFullName('')).toEqual({ firstName: '', lastName: '' });
    expect(splitFullName('   ')).toEqual({ firstName: '', lastName: '' });
  });
});
