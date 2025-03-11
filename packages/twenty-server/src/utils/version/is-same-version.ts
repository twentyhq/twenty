import * as semver from 'semver';

export function isSameVersion(version1: string, version2: string): boolean {
  const invalidVersion = [version1, version2].filter(
    (version) => semver.parse(version) === null,
  );
  console.log(invalidVersion);
  if (invalidVersion.length > 0) {
    throw new Error(`Received invalid version: ${invalidVersion.join(' ')}`);
  }

  const result = semver.compare(version1, version2);

  return result === 0;
}
