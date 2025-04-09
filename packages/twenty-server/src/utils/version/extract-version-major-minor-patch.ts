import semver from 'semver';

export const extractVersionMajorMinorPatch = (version: string | undefined) => {
  const parsed = semver.parse(version);

  if (parsed === null) {
    return null;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
};
