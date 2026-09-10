import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

describe('isStandaloneVariableString', () => {
  it('rejects non-string values', () => {
    expect(isStandaloneVariableString(42)).toBe(false);
  });

  it('accepts a standalone variable', () => {
    expect(isStandaloneVariableString('{{ test.a.b.c }}')).toBe(true);
  });

  it('rejects leading text', () => {
    expect(isStandaloneVariableString(' {{ test.a.b.c }}')).toBe(false);
  });

  it('rejects trailing text', () => {
    expect(isStandaloneVariableString('{{ test.a.b.c }} ')).toBe(false);
  });
});
