import {
  canonicalizeEmail,
  getEmailMatchCandidates,
} from '@/utils/email/canonicalizeEmail';

describe('canonicalizeEmail', () => {
  it.each([
    {
      category: 'ASCII',
      input: 'Admin@EXAMPLE.COM',
      expected: 'admin@example.com',
    },
    {
      category: 'international Latin',
      input: 'user@münchen.de',
      expected: 'user@xn--mnchen-3ya.de',
    },
    {
      category: 'Cyrillic',
      input: 'user@пример.рф',
      expected: 'user@xn--e1afmkfd.xn--p1ai',
    },
    {
      category: 'Turkish casing',
      input: 'user@İSTANBUL.example',
      expected: 'user@xn--istanbul-o0e.example',
    },
    {
      category: 'CJK',
      input: 'user@例え.テスト',
      expected: 'user@xn--r8jz45g.xn--zckzah',
    },
    {
      category: 'right-to-left Arabic',
      input: 'user@مثال.إختبار',
      expected: 'user@xn--mgbh0fb.xn--kgbechtv',
    },
    {
      category: 'emoji',
      input: 'admin@💩.la',
      expected: 'admin@xn--ls8h.la',
    },
  ])('canonicalizes a $category domain', ({ input, expected }) => {
    expect(canonicalizeEmail(input)).toBe(expected);
  });

  it('canonicalizes Unicode and punycode spellings to the same value', () => {
    expect(canonicalizeEmail('admin@💩.la')).toBe(
      canonicalizeEmail('admin@xn--ls8h.la'),
    );
  });

  it('normalizes Unicode dot variants and trailing dots', () => {
    expect(canonicalizeEmail('user@例え。テスト.')).toBe(
      'user@xn--r8jz45g.xn--zckzah',
    );
  });

  it('normalizes canonically equivalent domain labels', () => {
    expect(canonicalizeEmail('user@mu\u0308nchen.de')).toBe(
      canonicalizeEmail('user@münchen.de'),
    );
  });

  it('preserves local-part punctuation while retaining existing lowercase behavior', () => {
    expect(canonicalizeEmail('Admin+Tag.With.Dots@💩.la')).toBe(
      'admin+tag.with.dots@xn--ls8h.la',
    );
  });

  it('does not strip a meaningful www domain label', () => {
    expect(canonicalizeEmail('admin@www.example.com')).toBe(
      'admin@www.example.com',
    );
  });

  it('does not interpret URL structural characters in a malformed domain', () => {
    expect(canonicalizeEmail('admin@example.com/path')).toBe(
      'admin@example.com/path',
    );
  });
});

describe('getEmailMatchCandidates', () => {
  it('returns both legacy Unicode and canonical IDNA spellings', () => {
    expect(getEmailMatchCandidates('Admin@💩.LA')).toEqual([
      'admin@💩.la',
      'admin@xn--ls8h.la',
    ]);
  });

  it('deduplicates an already canonical address', () => {
    expect(getEmailMatchCandidates('Admin@EXAMPLE.COM')).toEqual([
      'admin@example.com',
    ]);
  });
});
