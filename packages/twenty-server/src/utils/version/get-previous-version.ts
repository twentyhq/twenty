import { SemVer } from 'semver';

type GetPreviousVersionFromArrayArgs = {
  versions: string[];
  currentVersion: string;
};
export const getPreviousVersion = ({
  versions,
  currentVersion,
}: GetPreviousVersionFromArrayArgs): SemVer | undefined => {
  try {
    const semverVersions = versions
      .map((version) => new SemVer(version))
      .sort((a, b) => b.compare(a));

    const currentSemver = new SemVer(currentVersion);

    const previousVersion = semverVersions.find(
      (version) => version.compare(currentSemver) < 0,
    );

    return previousVersion;
  } catch {
    return undefined;
  }
};
