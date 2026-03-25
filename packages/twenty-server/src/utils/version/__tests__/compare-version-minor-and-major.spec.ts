import { type EachTestingContext } from 'twenty-shared/testing';

import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';

type IsSameVersionTestCase = EachTestingContext<{
  version1: string;
  version2: string;
  expected?: CompareVersionMajorAndMinorReturnType;
  expectToThrow?: boolean;
}>;
describe('It should compare two versions with', () => {
  const beneathVersionTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: '1.0.0',
        version2: '1.1.0',
        expected: 'lower',
      },
      title: 'different minor version',
    },
    {
      context: {
        version1: '2.3.0',
        version2: '2.4.0',
        expected: 'lower',
      },
      title: 'different minor version',
    },
    {
      context: {
        version1: '0.1.0',
        version2: '0.2.0',
        expected: 'lower',
      },
      title: 'different minor version with zero major',
    },
    {
      context: {
        version1: '2.3.5',
        version2: '2.4.1',
        expected: 'lower',
      },
      title: 'different minor and patch versions',
    },
    {
      context: {
        version1: '1.0.0-alpha',
        version2: '1.1.0-beta',
        expected: 'lower',
      },
      title: 'different minor version with different pre-release tags',
    },
    {
      context: {
        version1: 'v1.0.0',
        version2: 'v1.1.0',
        expected: 'lower',
      },
      title: 'different minor version with v prefix',
    },
    {
      context: {
        version1: '2.0.0',
        version2: '42.42.42',
        expected: 'lower',
      },
      title: 'above version2',
    },
    {
      context: {
        version1: '2.0.0',
        version2: 'v42.42.42',
        expected: 'lower',
      },
      title: 'above version2 with v-prefix',
    },
  ];

  const sameVersionTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: '1.1.0',
        version2: '1.1.0',
        expected: 'equal',
      },
      title: 'exact same version',
    },
    {
      context: {
        version1: '1.1.0',
        version2: '1.1.42',
        expected: 'equal',
      },
      title: 'exact same major and minor but different patch version',
    },
    {
      context: {
        version1: 'v1.1.0',
        version2: 'v1.1.0',
        expected: 'equal',
      },
      title: 'exact same version with v prefix',
    },
    {
      context: {
        version1: '1.1.0-alpha',
        version2: '1.1.0-alpha',
        expected: 'equal',
      },
      title: 'exact same version with same pre-release tag',
    },
    {
      context: {
        version1: '0.0.1',
        version2: '0.0.1',
        expected: 'equal',
      },
      title: 'exact same version with all zeros',
    },
    {
      context: {
        version1: 'v1.1.0',
        version2: '1.1.0',
        expected: 'equal',
      },
      title: 'same version with different v-prefix',
    },
  ];

  const aboveVersionTestCases: IsSameVersionTestCase[] = [
    {
      context: {
        version1: 'v42.1.0',
        version2: '2.0.0',
        expected: 'higher',
      },
      title: 'above version',
    },
    {
      context: {
        version1: '42.42.42',
        version2: '2.0.0',
        expected: 'higher',
      },
      title: 'above version with prefix',
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
    ...beneathVersionTestCases,
    ...aboveVersionTestCases,
  ])(
    ' $title',
    ({ context: { version1, version2, expected, expectToThrow = false } }) => {
      if (expectToThrow) {
        expect(() =>
          compareVersionMajorAndMinor(version1, version2),
        ).toThrowErrorMatchingSnapshot();
      } else {
        expect(compareVersionMajorAndMinor(version1, version2)).toBe(expected);
      }
    },
  );
});
