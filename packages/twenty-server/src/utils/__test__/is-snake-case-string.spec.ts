import { type EachTestingContext } from 'twenty-shared/testing';

import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

type IsSnakeCaseStringTestCase = EachTestingContext<{
  input: string;
  expected: boolean;
}>;

const testCases: IsSnakeCaseStringTestCase[] = [
  { title: 'single word', context: { input: 'FOO', expected: true } },
  { title: 'two words', context: { input: 'FOO_BAR', expected: true } },
  {
    title: 'words with numbers',
    context: { input: 'FOO1_BAR2', expected: true },
  },
  { title: 'lowercase', context: { input: 'foo_bar', expected: false } },
  {
    title: 'double underscore',
    context: { input: 'FOO__BAR', expected: false },
  },
  {
    title: 'dash instead of underscore',
    context: { input: 'FOO-BAR', expected: false },
  },
  {
    title: 'leading underscore',
    context: { input: '_FOO_BAR', expected: false },
  },
  {
    title: 'trailing underscore',
    context: { input: 'FOO_BAR_', expected: false },
  },
  { title: 'empty string', context: { input: '', expected: false } },
  {
    title: 'space instead of underscore',
    context: { input: 'FOO BAR', expected: false },
  },
];

describe('is-snake-case-string', () => {
  test.each(testCases)('$title', ({ context: { input, expected } }) => {
    expect(isSnakeCaseString(input)).toBe(expected);
  });
});
