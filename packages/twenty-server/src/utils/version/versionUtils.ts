import * as semver from 'semver';

type IsOneMinorVersionHigherArgs = {
  from: string;
  to: string;
};
export function isOneMinorVersionHigher({
  from,
  to,
}: IsOneMinorVersionHigherArgs): boolean {
  const fromVersion = semver.parse(from);
  const toVersion = semver.parse(to);

  // isDefined not enough here :thinking:
  if (!fromVersion || !toVersion) {
    return false;
  }

  if (fromVersion.major !== toVersion.major) {
    return false;
  }

  return toVersion.minor === fromVersion.minor + 1;
}
