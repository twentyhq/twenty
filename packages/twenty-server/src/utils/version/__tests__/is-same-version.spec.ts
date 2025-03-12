import { EachTestingContext } from 'twenty-shared';

import { isSameVersion } from 'src/utils/version/is-same-version';

type IsSameVersionTestCase = EachTestingContext<{
  version1: string;
  version2: string;
  expected?: boolean;
  expectToThrow?: boolean;
}>;
describe('is-same-version', () => {
  const differentVersionTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: '1.0.0',
        version2: '1.1.0',
      },
      title: 'different minor version',
    },
    {
      context: {
        version1: '2.3.0',
        version2: '2.4.0',
      },
      title: 'different minor version',
    },
    {
      context: {
        version1: '0.1.0',
        version2: '0.2.0',
      },
      title: 'different minor version with zero major',
    },
    {
      context: {
        version1: '2.3.5',
        version2: '2.4.1',
      },
      title: 'different minor and patch versions',
    },
    {
      context: {
        version1: '1.0.0-alpha',
        version2: '1.1.0-beta',
      },
      title: 'different minor version with different pre-release tags',
    },
    {
      context: {
        version1: 'v1.0.0',
        version2: 'v1.1.0',
      },
      title: 'different minor version with v prefix',
    },
  ];

  const sameVersionTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: '1.1.0',
        version2: '1.1.0',
        expected: true,
      },
      title: 'exact same version',
    },
    {
      context: {
        version1: 'v1.1.0',
        version2: 'v1.1.0',
        expected: true,
      },
      title: 'exact same version with v prefix',
    },
    {
      context: {
        version1: '1.1.0-alpha',
        version2: '1.1.0-alpha',
        expected: true,
      },
      title: 'exact same version with same pre-release tag',
    },
    {
      context: {
        version1: '0.0.1',
        version2: '0.0.1',
        expected: true,
      },
      title: 'exact same version with all zeros',
    },
    {
      context: {
        version1: 'v1.1.0',
        version2: '1.1.0',
        expected: true,
      },
      title: 'same version with different v-prefix',
    },
  ];

  const invalidTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: 'invalid',
        version2: '1.1.0',
        expectToThrow: true,
      },
      title: 'invalid version1',
    },
    {
      context: {
        version1: '1.0.0',
        version2: 'invalid',
        expectToThrow: true,
      },
      title: 'invalid version2',
    },
    {
      context: {
        version1: '1.0',
        version2: '1.1.0',
        expectToThrow: true,
      },
      title: 'incomplete version1',
    },
  ];

  test.each([
    ...sameVersionTestCases,
    ...invalidTestCases,
    ...differentVersionTestCases,
  ])(
    '$title',
    ({
      context: { version1, version2, expected = false, expectToThrow = false },
    }) => {
      if (expectToThrow) {
        expect(() =>
          isSameVersion(version1, version2),
        ).toThrowErrorMatchingSnapshot();
      } else {
        expect(isSameVersion(version1, version2)).toBe(expected);
      }
    },
  );
});
