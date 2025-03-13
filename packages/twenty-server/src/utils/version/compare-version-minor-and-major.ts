import * as semver from 'semver';

export function compareVersionMajorAndMinor(
  rawVersion1: string,
  rawVersion2: string,
): -1 | 0 | 1 {
  const [version1, version2] = [rawVersion1, rawVersion2].map((version) =>
    semver.parse(version),
  );

  if (version1 === null || version2 === null) {
    throw new Error(`Received invalid version: ${rawVersion1} ${rawVersion2}`);
  }

  const v1WithoutPatch = `${version1.major}.${version1.minor}.0`;
  const v2WithoutPatch = `${version2.major}.${version2.minor}.0`;

  return semver.compare(v1WithoutPatch, v2WithoutPatch);
}
