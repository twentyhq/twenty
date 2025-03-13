import * as semver from 'semver';

export function isSameMajorAndMinorVersion(rawVersion1: string, rawVersion2: string): boolean {
  const [version1, version2] = [rawVersion1, rawVersion2].map(
    (version) => semver.parse(version),
  );

  if (version1 === null || version2 === null) {
    throw new Error(`Received invalid version: ${rawVersion1} ${rawVersion2}`);
  }

  const diffMajor = version1.major !== version2.major;
  const diffMinor = version1.minor !== version2.minor;
  return !diffMajor && !diffMinor
}
