import { matchesLikePattern } from 'src/engine/workspace-event-emitter/utils/matches-like-pattern.util';

const cases: [string, string, string, boolean][] = [
  ['exact value', 'ada@twenty.com', 'ada@twenty.com', true],
  ['suffix wildcard', 'ada@twenty.com', '%@twenty.com', true],
  ['prefix wildcard', 'ada@twenty.com', 'ada@%', true],
  ['inner wildcard', 'ada@twenty.com', 'a%m', true],
  ['wildcard matches the empty string', 'ab', 'a%b', true],
  ['single character wildcard', 'FROM', 'FR_M', true],
  ['single character wildcard needs a character', 'FRM', 'FR_M', false],
  ['miss', 'ada@twenty.com', '%@acme.com', false],
  ['case sensitive', 'Ada@Twenty.com', '%@twenty.com', false],
  ['escaped percent is literal', '100%', '100\\%', true],
  ['escaped percent does not act as a wildcard', '1000', '100\\%', false],
  ['escaped underscore is literal', 'a_b', 'a\\_b', true],
  ['escaped underscore does not act as a wildcard', 'axb', 'a\\_b', false],
  ['escaped backslash is literal', 'a\\b', 'a\\\\b', true],
  ['trailing backslash is literal', 'a\\', 'a\\', true],
  ['several wildcards', 'the quick brown fox', '%quick%fox', true],
  ['several wildcards miss', 'the quick brown fox', '%quick%cat', false],
];

describe('matchesLikePattern', () => {
  it.each(cases)('%s', (_label, value, pattern, expected) => {
    expect(matchesLikePattern({ value, pattern, caseInsensitive: false })).toBe(
      expected,
    );
  });

  it('ignores case when asked', () => {
    expect(
      matchesLikePattern({
        value: 'Ada@Twenty.com',
        pattern: '%@twenty.COM',
        caseInsensitive: true,
      }),
    ).toBe(true);
  });

  it('stays linear on patterns that make a regular expression backtrack', () => {
    expect(
      matchesLikePattern({
        value: 'a'.repeat(20000),
        pattern: '%a%a%a%a%a%a%b',
        caseInsensitive: false,
      }),
    ).toBe(false);
  });

  it('compares code points rather than UTF-16 units', () => {
    expect(
      matchesLikePattern({ value: '😀', pattern: '_', caseInsensitive: false }),
    ).toBe(true);
  });
});
