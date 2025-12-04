import { lowercaseUrlOriginAndRemoveTrailingSlash } from '@/utils/url/lowercaseUrlOriginAndRemoveTrailingSlash';

interface TestContext {
  title: string;
  input: string;
  expected: string;
}

describe('lowercaseUrlOriginAndRemoveTrailingSlash', () => {
  test.each<TestContext>([
    {
      title: 'should leave lowcased domain unchanged',
      input: 'https://www.example.com/test',
      expected: 'https://www.example.com/test',
    },
    {
      title: 'should lowercase the domain while preserving path case',
      input: 'htTps://wwW.exAmple.coM/TEST',
      expected: 'https://www.example.com/TEST',
    },
    {
      title: 'should not add a trailing slash',
      input: 'https://www.example.com',
      expected: 'https://www.example.com',
    },
    {
      title: 'should remove trailing slash',
      input: 'https://www.example.com/',
      expected: 'https://www.example.com',
    },
    {
      title: 'should handle query parameters',
      input: 'htTps://wwW.exAmple.coM/TEST?Param=Value',
      expected: 'https://www.example.com/TEST?Param=Value',
    },
    {
      title: 'should handle hash fragments',
      input: 'htTps://wwW.exAmple.coM/TEST#Hash',
      expected: 'https://www.example.com/TEST#Hash',
    },
    {
      title: 'should preserve special characters in path',
      input: 'https://test.test/frédéric-destombes-22219837',
      expected: 'https://test.test/frédéric-destombes-22219837',
    },
    {
      title: 'should decode already encoded special characters in path',
      input: 'https://test.test/fr%C3%A9d%C3%A9ric-destombes-22219837',
      expected: 'https://test.test/frédéric-destombes-22219837',
    },
    {
      title: 'should preserve special characters in query params',
      input: 'https://example.com/path?name=José',
      expected: 'https://example.com/path?name=José',
    },
  ])('$title', ({ input, expected }) => {
    expect(lowercaseUrlOriginAndRemoveTrailingSlash(input)).toBe(expected);
  });
});
