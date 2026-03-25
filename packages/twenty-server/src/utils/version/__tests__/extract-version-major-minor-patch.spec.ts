import { type EachTestingContext } from 'twenty-shared/testing';

import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

type IsSameVersionTestCase = EachTestingContext<{
  version: string | undefined;
  expected: string | null;
}>;
describe('It should extract major.minor.patch values from a', () => {
  const testCase: IsSameVersionTestCase[] = [
    {
      context: {
        version: '1.0.0',
        expected: '1.0.0',
      },
      title: 'Basic version',
    },
    {
      context: {
        version: '2.3.4',
        expected: '2.3.4',
      },
      title: 'Version with non-zero patch',
    },
    {
      context: {
        version: '0.1.0',
        expected: '0.1.0',
      },
      title: 'Version with zero major',
    },
    {
      context: {
        version: '1.0.0-alpha',
        expected: '1.0.0',
      },
      title: 'Version with pre-release tag',
    },
    {
      context: {
        version: '1.0.0-beta.1',
        expected: '1.0.0',
      },
      title: 'Version with pre-release tag and number',
    },
    {
      context: {
        version: 'v1.0.0',
        expected: '1.0.0',
      },
      title: 'Version with v prefix',
    },
    {
      context: {
        version: '42.42.42',
        expected: '42.42.42',
      },
      title: 'Version with large numbers',
    },
    {
      context: {
        version: '1.2',
        expected: null,
      },
      title: 'Invalid version - missing patch number',
    },
    {
      context: {
        version: 'invalid',
        expected: null,
      },
      title: 'Invalid version - not semver format',
    },
    {
      context: {
        version: undefined,
        expected: null,
      },
      title: 'With undefined version',
    },
    {
      context: {
        version: '1.0.0.0',
        expected: null,
      },
      title: 'Invalid version - too many segments',
    },
    {
      context: {
        version: '1.a.0',
        expected: null,
      },
      title: 'Invalid version - non-numeric minor',
    },
    {
      context: {
        version: '',
        expected: null,
      },
      title: 'Invalid version - empty string',
    },
  ];

  test.each(testCase)(' $title', ({ context: { version, expected } }) => {
    expect(extractVersionMajorMinorPatch(version)).toBe(expected);
  });
});
