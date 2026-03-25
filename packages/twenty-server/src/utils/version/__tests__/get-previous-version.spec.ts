import { type EachTestingContext } from 'twenty-shared/testing';

import { getPreviousVersion } from 'src/utils/version/get-previous-version';

type GetPreviousVersionTestCase = EachTestingContext<{
  versions: string[];
  currentVersion: string;
  expected: string | undefined;
}>;

describe('It should return the previous version from a list of', () => {
  const testCase: GetPreviousVersionTestCase[] = [
    {
      context: {
        versions: ['0.1.0', '0.2.0', '0.3.0'],
        currentVersion: '0.3.0',
        expected: '0.2.0',
      },
      title: 'Basic version sequence',
    },
    {
      context: {
        versions: ['1.0.0', '1.1.0', '2.0.0'],
        currentVersion: '2.0.0',
        expected: '1.1.0',
      },
      title: 'Major version jump',
    },
    {
      context: {
        versions: ['0.1.0', '0.1.1', '0.1.2'],
        currentVersion: '0.1.2',
        expected: '0.1.1',
      },
      title: 'Patch version sequence',
    },
    {
      context: {
        versions: ['1.0.0'],
        currentVersion: '1.0.0',
        expected: undefined,
      },
      title: 'Single version',
    },
    {
      context: {
        versions: [],
        currentVersion: '1.0.0',
        expected: undefined,
      },
      title: 'Empty version array',
    },
    {
      context: {
        versions: ['0.1.0', '0.2.0', '0.3.0'],
        currentVersion: '0.1.0',
        expected: undefined,
      },
      title: 'No previous version available',
    },
    {
      context: {
        versions: ['1.0.0', '2.0.0', '1.5.0'],
        currentVersion: '2.0.0',
        expected: '1.5.0',
      },
      title: 'Unordered versions',
    },
    {
      context: {
        versions: ['1.0.0', '1.0.0-alpha', '1.0.0-beta'],
        currentVersion: '1.0.0',
        expected: '1.0.0-beta',
      },
      title: 'Pre-release versions',
    },
    {
      context: {
        versions: ['invalid', '1.0.0', '2.0.0'],
        currentVersion: '2.0.0',
        expected: undefined,
      },
      title: 'Invalid version in array',
    },
    {
      context: {
        versions: ['1.0.0', '2.0.0'],
        currentVersion: 'invalid',
        expected: undefined,
      },
      title: 'Invalid current version',
    },
  ];

  test.each(testCase)(
    ' $title',
    ({ context: { versions, currentVersion, expected } }) => {
      const result = getPreviousVersion({ versions, currentVersion });

      expect(result?.format()).toBe(expected);
    },
  );
});
