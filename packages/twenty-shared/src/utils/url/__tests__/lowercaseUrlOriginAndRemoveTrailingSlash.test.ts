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
      input: 'https://test.test/edouard-ménard-22219837',
      expected: 'https://test.test/edouard-ménard-22219837',
    },
    {
      title: 'should decode already encoded special characters in path',
      input: 'https://test.test/edouard-m%C3%A9nard-22219837',
      expected: 'https://test.test/edouard-ménard-22219837',
    },
    {
      title: 'should preserve special characters in query params',
      input: 'https://example.com/path?name=José',
      expected: 'https://example.com/path?name=José',
    },
    {
      title:
        'should handle malformed percent-encoding gracefully (incomplete sequence)',
      input: 'https://example.com/test%E0%A4%A',
      expected: 'https://example.com/test%E0%A4%A',
    },
    {
      title:
        'should preserve double-encoded URLs (encoded percent signs stay encoded once)',
      input: 'https://example.com/test%2520name',
      expected: 'https://example.com/test%20name',
    },
    {
      title: 'should preserve special characters in hash fragments',
      input: 'https://example.com/path#frédéric',
      expected: 'https://example.com/path#fr%C3%A9d%C3%A9ric',
    },
    {
      title: 'should keep encoded characters in hash fragments as-is',
      input: 'https://example.com/path#fr%C3%A9d%C3%A9ric',
      expected: 'https://example.com/path#fr%C3%A9d%C3%A9ric',
    },
    {
      title: 'should handle mixed encoded and non-encoded in same URL',
      input: 'https://example.com/path%2Fwith%2Fslashes?query=hello%20world',
      expected: 'https://example.com/path/with/slashes?query=hello world',
    },
  ])('$title', ({ input, expected }) => {
    expect(lowercaseUrlOriginAndRemoveTrailingSlash(input)).toBe(expected);
  });
});
