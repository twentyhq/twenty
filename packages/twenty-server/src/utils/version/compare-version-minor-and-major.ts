import * as semver from 'semver';

export type CompareVersionMajorAndMinorReturnType =
  | 'lower'
  | 'equal'
  | 'higher';
export function compareVersionMajorAndMinor(
  rawVersion1: string,
  rawVersion2: string,
): CompareVersionMajorAndMinorReturnType {
  const [version1, version2] = [rawVersion1, rawVersion2].map((version) =>
    semver.parse(version),
  );

  if (version1 === null || version2 === null) {
    throw new Error(`Received invalid version: ${rawVersion1} ${rawVersion2}`);
  }

  const v1WithoutPatch = `${version1.major}.${version1.minor}.0`;
  const v2WithoutPatch = `${version2.major}.${version2.minor}.0`;

  const compareResult = semver.compare(v1WithoutPatch, v2WithoutPatch);

  switch (compareResult) {
    case -1: {
      return 'lower';
    }
    case 0: {
      return 'equal';
    }
    case 1: {
      return 'higher';
    }
    default: {
      throw new Error(
        `Should never occur, encountered an unexpected value from semver.compare ${compareResult}`,
      );
    }
  }
}
