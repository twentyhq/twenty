import { isOneMinorVersionHigher } from 'src/utils/version/versionUtils';

type TestCase = {
  context: {
    from: string;
    to: string;
    expected?: boolean;
  };
  title: string;
};

describe('isOneMinorVersionHigher', () => {
  describe('valid cases', () => {
    const validTestCases: TestCase[] = [
      {
        context: {
          from: '1.0.0',
          to: '1.1.0',
        },
        title: 'exact one minor version higher',
      },
      {
        context: {
          from: '2.3.0',
          to: '2.4.0',
        },
        title: 'exact one minor version higher',
      },
      {
        context: {
          from: '0.1.0',
          to: '0.2.0',
        },
        title: 'exact one minor version higher with zero major',
      },
      {
        context: {
          from: '2.3.5',
          to: '2.4.1',
        },
        title: 'different patch versions in both',
      },
      {
        context: {
          from: '1.0.0-alpha',
          to: '1.1.0-beta',
        },
        title: 'pre-release in both versions',
      },
      {
        context: {
          from: 'v1.0.0',
          to: 'v1.1.0',
        },
        title: 'versions with v prefix',
      },
    ];

    const invalidTestCases: TestCase[] = [
      {
        context: {
          from: '1.0.0',
          to: '1.2.0',
          expected: false,
        },
        title: 'minor version difference is more than 1',
      },
      {
        context: {
          from: '2.0.0',
          to: '3.1.0',
          expected: false,
        },
        title: 'different major versions with minor increment',
      },
      {
        context: {
          from: '1.1.0',
          to: '1.0.0',
          expected: false,
        },
        title: 'to version is lower than from version',
      },
      {
        context: {
          from: 'invalid',
          to: '1.1.0',
          expected: false,
        },
        title: 'invalid version1',
      },
      {
        context: {
          from: '1.0.0',
          to: 'invalid',
          expected: false,
        },
        title: 'invalid version2',
      },
      {
        context: {
          from: '1.0',
          to: '1.1.0',
          expected: false,
        },
        title: 'incomplete version1',
      },
    ];

    test.each(invalidTestCases)(
      '$title (comparing $context.from and $context.to)',
      ({ context: { from, to, expected = true } }) => {
        expect(isOneMinorVersionHigher({ from, to })).toBe(expected);
      },
    );
  });
});
