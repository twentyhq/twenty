import { quoteSingle } from '../quoteSingle';

describe('quoteSingle', () => {
  it('wraps a plain value in single quotes', () => {
    expect(quoteSingle('8px')).toBe("'8px'");
  });

  it('escapes backslashes before quotes so the escape is not doubled', () => {
    expect(quoteSingle('a\\b')).toBe("'a\\\\b'");
  });

  it('escapes single quotes', () => {
    expect(quoteSingle("Inter, 'DM Mono'")).toBe("'Inter, \\'DM Mono\\''");
  });
});
